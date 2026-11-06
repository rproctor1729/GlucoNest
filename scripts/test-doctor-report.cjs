// Unit tests for the doctor report, today summary and glossary logic. Run: npm run test:report
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
const { buildReport } = load('src/utils/doctorReport.ts');
const { summarizeToday } = load('src/utils/today.ts');
const { GLOSSARY } = load('src/utils/glossary.ts');

test('report uses only the readings given and counts the period', () => {
  const now = new Date(2026, 10, 3, 12, 0);
  const iso = (d, h) => new Date(2026, 10, d, h, 0).toISOString();
  const readings = [
    { id: 'a', timestamp: iso(3, 8), timeLabel: '8', value: 110 },
    { id: 'b', timestamp: iso(3, 9), timeLabel: '9', value: 60 },
    { id: 'c', timestamp: iso(1, 9), timeLabel: '9', value: 150 },
  ];
  const report = buildReport(readings, [], [], 14, now);
  assert.equal(report.readingCount, 3);
  assert.equal(report.daily.length, 2);
  const day3 = report.daily.find((d) => d.date === '2026-11-03');
  assert.equal(day3.lows, 1);
  assert.equal(day3.max, 110);
});

test('today summary counts only today', () => {
  const now = new Date(2026, 10, 3, 18, 0, 0);
  const today = (h, m) => new Date(2026, 10, 3, h, m).toISOString();
  const yesterday = new Date(2026, 10, 2, 9, 0).toISOString();
  const readings = [
    { id: '1', timestamp: today(8, 0), timeLabel: '8:00', value: 65 },
    { id: '2', timestamp: today(12, 0), timeLabel: '12:00', value: 130 },
    { id: '3', timestamp: today(15, 0), timeLabel: '15:00', value: 200 },
    { id: '4', timestamp: yesterday, timeLabel: '9:00', value: 90 },
  ];
  const meals = [
    { id: 'm1', timestamp: today(8, 30), mealType: 'breakfast', name: 'Idli', items: [], totalCarbs: 45 },
    { id: 'm2', timestamp: today(13, 0), mealType: 'lunch', name: 'Roti', items: [], totalCarbs: 48 },
  ];
  const insulin = [{ id: 'i1', timestamp: today(13, 0), type: 'rapid', units: 4 }];
  const s = summarizeToday(readings, meals, insulin, now);
  assert.equal(s.readingCount, 3);
  assert.equal(s.lowCount, 1);
  assert.equal(s.highCount, 1);
  assert.equal(s.mealCount, 2);
  assert.equal(s.carbsTotal, 93);
  assert.equal(s.insulinUnits, 4);
});

test('glossary defines every abbreviation used in the report', () => {
  for (const key of ['tir', 'tbr', 'tar', 'cv', 'gmi']) {
    assert.ok(GLOSSARY[key].term && GLOSSARY[key].plain, key);
  }
});
