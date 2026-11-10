const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const ts = require('typescript');

function loadTypeScriptModule(relativePath) {
  const source = fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');
  const javascript = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const loadedModule = { exports: {} };
  new Function('exports', 'require', 'module', javascript)(
    loadedModule.exports,
    (request) => loadTypeScriptModule(path.join(path.dirname(relativePath), request + '.ts')),
    loadedModule
  );
  return loadedModule.exports;
}

const { parseGlucoseCsv } = loadTypeScriptModule('src/lib/csvImport.ts');

test('parses quoted CSV columns and normalizes mmol/L to mg/dL', () => {
  const result = parseGlucoseCsv(
    'Timestamp,Glucose,Units,Note\r\n2025-01-02T10:00:00Z,5.5,mmol/L,"before, lunch"\r\n'
  );
  assert.equal(result.readings.length, 1);
  assert.equal(result.readings[0].value, 99);
  assert.equal(result.readings[0].source, 'manual');
  assert.deepEqual(result.rejectedRows, []);
});

test('reports invalid rows while preserving valid readings', () => {
  const result = parseGlucoseCsv(
    'Date,Time,Value,Unit\n2025-01-02,10:00,120,mg/dL\nnot-a-date,11:00,130,mg/dL\n2025-01-02,12:00,700,mg/dL\n'
  );
  assert.equal(result.readings.length, 1);
  assert.deepEqual(result.rejectedRows, [3, 4]);
});

test('uses the glucose header units when an optional units cell is blank', () => {
  const result = parseGlucoseCsv('Timestamp,Glucose (mmol/L),Units\n2026-11-08T09:00:00Z,5.5,\n2026-11-08T09:05:00Z,120,mg/dL');
  assert.deepEqual(result.readings.map((reading) => reading.value), [99, 120]);
  assert.deepEqual(result.rejectedRows, []);
});

test('rejects unknown shapes, malformed quoting, empty data, and oversized input', () => {
  assert.throws(() => parseGlucoseCsv('Name,Value\nA,1'), /timestamp or date/);
  assert.throws(() => parseGlucoseCsv('Timestamp,Value\n"not closed,120'), /unclosed quoted/);
  assert.throws(() => parseGlucoseCsv('Timestamp,Value\n2025-01-02,invalid'), /No valid/);
  assert.throws(() => parseGlucoseCsv('x'.repeat(5 * 1024 * 1024 + 1)), /5 MB/);
  assert.throws(
    () => parseGlucoseCsv(`Timestamp,Value\n${'2025-01-02T10:00:00Z,120\n'.repeat(10001)}`),
    /10,000 data rows/
  );
});
