const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const ts = require('typescript');

function loadTypeScriptModule(relativePath) {
  const filename = path.join(process.cwd(), relativePath);
  const source = fs.readFileSync(filename, 'utf8');
  const javascript = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
  }).outputText;
  const module = { exports: {} };
  new Function('exports', 'require', 'module', javascript)(module.exports, require, module);
  return module.exports;
}

const nightscout = loadTypeScriptModule('src/lib/integrations/nightscout.ts');
const { calculateDetailedTIR } = loadTypeScriptModule('src/utils/tirCalculator.ts');
const fixture = JSON.parse(fs.readFileSync(
  path.join(process.cwd(), 'tests/fixtures/nightscout-entries.json'),
  'utf8'
));

async function withMockFetch(mockFetch, callback) {
  const originalFetch = global.fetch;
  global.fetch = mockFetch;
  try {
    await callback();
  } finally {
    global.fetch = originalFetch;
  }
}

test('normalizes fixture entries, timestamp formats, trends, units and duplicates', () => {
  const readings = nightscout.parseNightscoutEntries(fixture);
  assert.equal(readings.length, 2);
  assert.equal(readings[0].value, 68);
  assert.equal(readings[0].trend, 'FLAT');
  assert.equal(readings[1].value, 144);
  assert.equal(readings[1].trend, 'SLIGHT_UP');
  assert.equal(readings[1].source, 'nightscout');
  assert.equal(readings[1].originalSource, 'sample-cgm');
  assert.equal(Number.isFinite(Date.parse(readings[0].timestamp)), true);
  assert.equal(nightscout.parseNightscoutEntries([]).length, 0);
  assert.throws(
    () => nightscout.parseNightscoutEntries({ entries: fixture }),
    (error) => error.code === 'malformed-response'
  );
});

test('requests the configurable read-only history endpoint without putting tokens in URLs', async () => {
  await withMockFetch(async (url, options) => {
    const requestUrl = new URL(url);
    assert.equal(requestUrl.hostname, 'nightscout.example');
    assert.equal(requestUrl.pathname, '/api/v1/entries/sgv.json');
    assert.equal(requestUrl.searchParams.get('count'), '42');
    assert.equal(requestUrl.searchParams.has('token'), false);
    assert.equal(options.method, 'GET');
    assert.equal(options.headers.Authorization, 'Bearer sample-read-token');
    return { ok: true, status: 200, json: async () => fixture };
  }, async () => {
    const readings = await nightscout.fetchNightscoutReadings({
      url: 'https://nightscout.example/',
      token: 'sample-read-token',
      historyLimit: 42,
    });
    assert.equal(readings.length, 2);
  });
});

test('supports publicly readable instances without sending authentication', async () => {
  await withMockFetch(async (_url, options) => {
    assert.equal(options.headers.Authorization, undefined);
    return { ok: true, status: 200, json: async () => [] };
  }, async () => {
    const readings = await nightscout.fetchNightscoutReadings({
      url: 'https://nightscout.example',
      historyLimit: 288,
    });
    assert.deepEqual(readings, []);
  });
});

test('validates URLs, HTTPS, and history limits before fetching', async () => {
  await assert.rejects(
    nightscout.fetchNightscoutReadings({ url: 'not a URL', historyLimit: 288 }),
    (error) => error.code === 'invalid-url'
  );
  await assert.rejects(
    nightscout.fetchNightscoutReadings({ url: 'http://nightscout.example', historyLimit: 288 }),
    (error) => error.code === 'insecure-url'
  );
  await assert.rejects(
    nightscout.fetchNightscoutReadings({ url: 'https://nightscout.example', historyLimit: 1001 }),
    (error) => error.code === 'invalid-limit'
  );
});

test('reports authentication, server and browser network/CORS failures without leaking tokens', async () => {
  await withMockFetch(async () => ({ ok: false, status: 401 }), async () => {
    await assert.rejects(
      nightscout.fetchNightscoutReadings({
        url: 'https://nightscout.example',
        token: 'never-include-this-in-errors',
        historyLimit: 10,
      }),
      (error) => error.code === 'unauthorized' && !error.message.includes('never-include-this-in-errors')
    );
  });

  await withMockFetch(async () => ({ ok: false, status: 503 }), async () => {
    await assert.rejects(
      nightscout.fetchNightscoutReadings({ url: 'https://nightscout.example', historyLimit: 10 }),
      (error) => error.code === 'server-error'
    );
  });

  await withMockFetch(async () => { throw new TypeError('blocked'); }, async () => {
    await assert.rejects(
      nightscout.fetchNightscoutReadings({ url: 'https://nightscout.example', historyLimit: 10 }),
      (error) => error.code === 'cors-or-network'
    );
  });

  await test('retries temporary server failures a bounded number of times', async () => {
    let requests = 0;
    await withMockFetch(async () => {
      requests += 1;
      return requests < 3
        ? { ok: false, status: 503 }
        : { ok: true, status: 200, json: async () => fixture };
    }, async () => {
      const readings = await nightscout.fetchNightscoutReadingsWithRetry({
        url: 'https://nightscout.example',
        historyLimit: 10,
      });
      assert.equal(requests, 3);
      assert.equal(readings.length, 2);
    });
  });
});

test('reports request timeout', async () => {
  await withMockFetch((_url, options) => new Promise((_resolve, reject) => {
    options.signal.addEventListener('abort', () => {
      const error = new Error('aborted');
      error.name = 'AbortError';
      reject(error);
    });
  }), async () => {
    await assert.rejects(
      nightscout.fetchNightscoutReadings({ url: 'https://nightscout.example', historyLimit: 10 }),
      (error) => error.code === 'timeout'
    );
  });
});

test('calculates time-in-range from usable intervals and excludes duplicates, gaps and invalid values', () => {
  const stats = calculateDetailedTIR([
    { value: 100, timestamp: '2026-11-03T09:00:00Z' },
    { value: 200, timestamp: '2026-11-03T09:05:00Z' },
    { value: 500, timestamp: '2026-11-03T09:05:00Z' },
    { value: 0, timestamp: '2026-11-03T09:10:00Z' },
    { value: 100, timestamp: '2026-11-03T10:00:00Z' },
  ]);
  assert.equal(stats.totalReadings, 3);
  assert.equal(stats.coverageMinutes, 5);
  assert.equal(stats.hasSufficientData, false);
  assert.equal(stats.hasSufficientVariabilityData, true);
  assert.equal(stats.hasSufficientGmiData, false);
  assert.equal(stats.inRangePercent, 100);

  const sparseStats = calculateDetailedTIR([
    { value: 120, timestamp: '2026-11-03T09:00:00Z' },
  ]);
  assert.equal(sparseStats.hasSufficientVariabilityData, false);
  assert.equal(sparseStats.hasSufficientGmiData, false);
});
