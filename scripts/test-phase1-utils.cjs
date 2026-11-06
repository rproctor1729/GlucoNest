// Phase 1 unit tests: TIR fallback, latest reading, demo visibility, timer chime lifecycle.
// Run with: npm test
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const ts = require('typescript');

require.extensions['.ts'] = (module, filename) => {
  const source = fs.readFileSync(filename, 'utf8');
  const { outputText } = ts.transpileModule(source, {
    fileName: filename,
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
  });
  module._compile(outputText, filename);
};

const load = (relative) => require(path.join(__dirname, '..', relative));
const { calculateDetailedTIR } = load('src/utils/tirCalculator.ts');
const { getLatestReading } = load('src/utils/latestReading.ts');
const { visibleRecords } = load('src/utils/demoVisibility.ts');
const { startTimerChime } = load('src/utils/timerChime.ts');

const bucketSum = (s) => s.veryLowPercent + s.lowPercent + s.inRangePercent + s.highPercent + s.veryHighPercent;
const minutesApart = (values, gapMinutes) =>
  values.map((value, i) => ({
    value,
    timestamp: new Date(Date.UTC(2026, 10, 3, 6, 0) + i * gapMinutes * 60000).toISOString(),
  }));

// ---- 1.1 TIR fallback ----
test('TIR: readings all more than 15 minutes apart use counts and sum to 100', () => {
  const readings = minutesApart([60, 120, 200, 300], 120);
  const s = calculateDetailedTIR(readings);
  assert.equal(bucketSum(s), 100);
  assert.equal(s.veryLowPercent, 0);
  assert.equal(s.lowPercent, 25);
  assert.equal(s.inRangePercent, 25);
  assert.equal(s.highPercent, 25);
  assert.equal(s.veryHighPercent, 25);
});

test('TIR: mixed gaps still use the weighted path', () => {
  // Five-minute gaps at the start, then a long gap. Count-based percentages would be 25% each.
  const readings = [
    ...minutesApart([60, 120, 200], 5),
    { value: 250, timestamp: new Date(Date.UTC(2026, 10, 3, 9, 0)).toISOString() },
  ];
  const s = calculateDetailedTIR(readings);
  assert.equal(bucketSum(s), 100);
  assert.notEqual(s.lowPercent, 25, 'weighted path should not fall back to counts');
  assert.ok(s.lowPercent + s.inRangePercent > 0);
});

test('TIR: a single reading gives a valid result with no NaN', () => {
  const s = calculateDetailedTIR([{ value: 150, timestamp: new Date(2026, 10, 3, 8).toISOString() }]);
  assert.equal(s.totalReadings, 1);
  assert.equal(bucketSum(s), 100);
  for (const value of Object.values(s)) {
    if (typeof value === 'number') assert.ok(Number.isFinite(value), `non-finite value in ${JSON.stringify(s)}`);
  }
});

test('TIR: empty input gives zeros, not NaN', () => {
  const s = calculateDetailedTIR([]);
  assert.equal(s.totalReadings, 0);
  assert.equal(bucketSum(s), 0);
});

// ---- 1.2 latest reading ----
test('latest reading uses the newest timestamp, not the last array item', () => {
  const readings = [
    { id: 'b', value: 110, timestamp: '2026-11-03T09:00:00Z' },
    { id: 'c', value: 90, timestamp: '2026-11-03T08:00:00Z' },
    { id: 'a', value: 150, timestamp: '2026-11-03T10:00:00Z' },
    { id: 'd', value: 120, timestamp: '2026-11-03T07:00:00Z' },
  ];
  assert.equal(getLatestReading(readings).id, 'a');
});

test('latest reading falls back to array order only for readings without a timestamp', () => {
  assert.equal(getLatestReading([{ id: 'x' }, { id: 'y' }]).id, 'y');
  const mixed = [{ id: 'old', timestamp: '2026-11-03T08:00:00Z' }, { id: 'no-time' }];
  assert.equal(getLatestReading(mixed).id, 'old');
});

test('latest reading returns null for an empty list and the later item on a tie', () => {
  assert.equal(getLatestReading([]), null);
  const tied = [
    { id: 'first', timestamp: '2026-11-03T08:00:00Z' },
    { id: 'second', timestamp: '2026-11-03T08:00:00Z' },
  ];
  assert.equal(getLatestReading(tied).id, 'second');
});

// ---- 1.3 demo visibility ----
test('demo meals are hidden once a real meal exists, and come back when real ones are cleared', () => {
  const demo = [{ id: 'sample-1', isDemo: true }, { id: 'sample-2', isDemo: true }];
  assert.deepEqual(visibleRecords(demo).map((m) => m.id), ['sample-1', 'sample-2']);

  const withReal = [...demo, { id: 'real-1', isDemo: false }];
  assert.deepEqual(visibleRecords(withReal).map((m) => m.id), ['real-1']);

  const realOnly = [{ id: 'real-1', isDemo: false }];
  assert.deepEqual(visibleRecords(realOnly).map((m) => m.id), ['real-1']);

  // Clearing the real records restores the samples. The stored array is never changed.
  const afterClear = withReal.filter((m) => m.isDemo);
  assert.deepEqual(visibleRecords(afterClear).map((m) => m.id), ['sample-1', 'sample-2']);
});

test('visibleRecords does not modify its input', () => {
  const input = [{ id: 's', isDemo: true }, { id: 'r', isDemo: false }];
  const before = JSON.stringify(input);
  visibleRecords(input);
  assert.equal(JSON.stringify(input), before);
  assert.deepEqual(visibleRecords([]), []);
});

// ---- 1.4 timer chime lifecycle ----
function fakeContext(options = {}) {
  const log = { created: 0, resumed: 0, closed: 0, oscillatorStarted: 0 };
  const context = {
    state: options.state ?? 'running',
    currentTime: 0,
    destination: {},
    resume: async () => {
      log.resumed += 1;
      if (options.resumeFails) throw new DOMException('needs gesture', 'NotAllowedError');
    },
    close: async () => {
      log.closed += 1;
    },
    createOscillator: () => {
      if (options.oscillatorFails) throw new Error('no audio');
      return {
        frequency: { setValueAtTime() {} },
        connect() {},
        start() { log.oscillatorStarted += 1; },
        stop() {},
      };
    },
    createGain: () => ({ gain: { setValueAtTime() {} }, connect() {} }),
  };
  return { context, log, factory: () => { log.created += 1; return context; } };
}

test('chime plays, then closes its AudioContext once', async () => {
  const { factory, log } = fakeContext({ state: 'suspended' });
  const chime = startTimerChime(factory);
  assert.equal(await chime.status, 'played');
  assert.equal(log.resumed, 1, 'suspended context must be resumed before playing');
  assert.equal(log.oscillatorStarted, 1);
  assert.equal(log.closed, 1);
});

test('chime does not throw when resume is refused, and closes the context', async () => {
  const { factory, log } = fakeContext({ state: 'suspended', resumeFails: true });
  const chime = startTimerChime(factory);
  assert.equal(await chime.status, 'blocked');
  assert.equal(log.oscillatorStarted, 0);
  assert.equal(log.closed, 1);
});

test('chime reports unavailable when the browser has no AudioContext', async () => {
  const chime = startTimerChime(() => null);
  assert.equal(await chime.status, 'unavailable');
  const throwing = startTimerChime(() => { throw new Error('no AudioContext'); });
  assert.equal(await throwing.status, 'unavailable');
});

test('chime reports error and still closes when the audio graph fails', async () => {
  const { factory, log } = fakeContext({ oscillatorFails: true });
  const chime = startTimerChime(factory);
  assert.equal(await chime.status, 'error');
  assert.equal(log.closed, 1);
});

test('cancelling a chime closes its context immediately; repeated open and close does not leak', async () => {
  const contexts = [];
  for (let i = 0; i < 5; i += 1) {
    const { factory, log } = fakeContext();
    contexts.push(log);
    const chime = startTimerChime(factory);
    await chime.cancel();
    assert.equal(await chime.status, 'cancelled');
    await chime.cancel(); // Cancelling twice is harmless.
    assert.equal(log.closed, 1, `context ${i} closed exactly once`);
  }
});
