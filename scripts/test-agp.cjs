const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const ts = require('typescript');

const source = fs.readFileSync(path.join(process.cwd(), 'src/utils/agp.ts'), 'utf8');
const javascript = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
const loadedModule = { exports: {} };
new Function('exports', 'require', 'module', javascript)(loadedModule.exports, require, loadedModule);
const { calculateAgpProfile } = loadedModule.exports;

test('calculates percentiles for 30-minute local-time bins and excludes invalid readings', () => {
  const values = [80, 90, 100, 110, 120];
  const readings = values.map((value, index) => ({
    timestamp: `2025-01-${String(index + 1).padStart(2, '0')}T10:00:00Z`,
    value,
  }));
  readings.push({ timestamp: 'invalid', value: 200 });
  const profile = calculateAgpProfile(readings);
  assert.equal(profile.length, 1);
  assert.equal(profile[0].count, 5);
  assert.equal(profile[0].percentile10, 84);
  assert.equal(profile[0].median, 100);
  assert.equal(profile[0].percentile90, 116);
});
