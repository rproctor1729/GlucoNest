const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const ts = require('typescript');

const source = fs.readFileSync(path.join(process.cwd(), 'src/utils/glucoseUtils.ts'), 'utf8');
const javascript = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
const loadedModule = { exports: {} };
new Function('exports', 'require', 'module', javascript)(loadedModule.exports, require, loadedModule);
const { getGlucoseStatus } = loadedModule.exports;

test('classifies severe lows and configurable target thresholds', () => {
  assert.equal(getGlucoseStatus(53, 80, 160), 'very-low');
  assert.equal(getGlucoseStatus(79, 80, 160), 'low');
  assert.equal(getGlucoseStatus(80, 80, 160), 'in-range');
  assert.equal(getGlucoseStatus(160, 80, 160), 'in-range');
  assert.equal(getGlucoseStatus(161, 80, 160), 'high');
  assert.equal(getGlucoseStatus(251, 80, 160), 'very-high');
});
