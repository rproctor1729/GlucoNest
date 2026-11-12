const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const ts = require('typescript');

require.extensions['.ts'] = (module, filename) => {
  const { outputText } = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    fileName: filename, compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
  });
  module._compile(outputText, filename);
};
const load = file => require(path.join(process.cwd(), file));
const { parseQuickEntry, timestampFor, describeEntry } = load('src/utils/quickEntry.ts');

test('insulin is recorded with its time and type, never calculated', () => {
  const { entries, errors } = parseQuickEntry('2u 15m ago');
  assert.deepEqual(errors, []);
  assert.equal(entries[0].kind, 'insulin');
  assert.equal(entries[0].units, 2);
  assert.equal(entries[0].subType, 'rapid');
  assert.equal(entries[0].minutesAgo, 15);
});

test('basal insulin is recognised by name or word', () => {
  assert.equal(parseQuickEntry('basal 18u').entries[0].subType, 'basal');
  assert.equal(parseQuickEntry('lantus 18 units').entries[0].subType, 'basal');
  assert.equal(parseQuickEntry('humalog 4u').entries[0].subType, 'rapid');
});

test('carbs in grams, with or without a label', () => {
  assert.deepEqual(parseQuickEntry('45g carbs').entries[0].grams, 45);
  assert.equal(parseQuickEntry('lunch 45g').entries[0].label, 'lunch');
  assert.equal(parseQuickEntry('carbs 30').entries[0].grams, 30);
  assert.equal(parseQuickEntry('30 carbs').entries[0].grams, 30);
});

test('exercise accepts minutes or hours, before or after the activity', () => {
  const run = parseQuickEntry('run 30m').entries[0];
  assert.equal(run.kind, 'exercise');
  assert.equal(run.minutes, 30);
  assert.equal(run.label, 'run');
  assert.equal(parseQuickEntry('30 min walk').entries[0].minutes, 30);
  assert.equal(parseQuickEntry('walk 1h').entries[0].minutes, 60);
});

test('a time ago is removed before the rest is read', () => {
  const { entries } = parseQuickEntry('walk 1h 10 min ago');
  assert.equal(entries[0].kind, 'exercise');
  assert.equal(entries[0].minutes, 60);
  assert.equal(entries[0].minutesAgo, 10);
});

test('several entries in one line are split', () => {
  const { entries, errors } = parseQuickEntry('2u 15m ago, 45g carbs, run 30m');
  assert.deepEqual(errors, []);
  assert.deepEqual(entries.map(e => e.kind), ['insulin', 'carbs', 'exercise']);
  assert.equal(parseQuickEntry('2u and 45g').entries.length, 2);
});

test('decimal insulin is allowed to one place only', () => {
  assert.equal(parseQuickEntry('2.5u').entries[0].units, 2.5);
  assert.equal(parseQuickEntry('2.55u').entries.length, 0);
  assert.ok(parseQuickEntry('2.55u').errors[0].includes('one decimal'));
});

test('out-of-range values are rejected with a reason', () => {
  assert.ok(parseQuickEntry('0u').errors.length === 1);
  assert.ok(parseQuickEntry('150u').errors.length === 1);
  assert.ok(parseQuickEntry('400g').errors.length === 1);
  assert.ok(parseQuickEntry('run 0m').errors.length === 1);
  assert.ok(parseQuickEntry('2u 25h ago').errors.length === 1);
});

test('unclear input is an error, not a silent guess', () => {
  assert.ok(parseQuickEntry('45').errors[0].includes('add a unit'));
  assert.ok(parseQuickEntry('xyz').errors[0].includes('not understood'));
  assert.ok(parseQuickEntry('2u 2 days ago').errors[0].includes('time was not understood'));
  assert.ok(parseQuickEntry('15m ago').errors[0].includes('add what it was'));
  assert.ok(parseQuickEntry('').errors.length === 1);
});

test('a partly readable line keeps the good entries and reports the rest', () => {
  const { entries, errors } = parseQuickEntry('2u, banana, 45g');
  assert.equal(entries.length, 2);
  assert.equal(errors.length, 1);
  assert.ok(errors[0].includes('banana'));
});

test('timestamps are shifted back by the stated time', () => {
  const now = Date.parse('2026-11-13T10:00:00.000Z');
  assert.equal(timestampFor({ minutesAgo: 15 }, now), '2026-11-13T09:45:00.000Z');
  assert.equal(timestampFor({ minutesAgo: 0 }, now), '2026-11-13T10:00:00.000Z');
});

test('the review text states what will be saved', () => {
  const [entry] = parseQuickEntry('2u basal 15m ago').entries;
  assert.equal(describeEntry(entry), '2 u basal insulin, 15 min ago');
});
