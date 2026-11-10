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
const { sectionFromHash, NAVIGATION_SECTIONS } = load('src/lib/navigation.ts');
const { localDateTimeInputs, parseLocalDateTime } = load('src/utils/localDateTime.ts');
const { buildReport } = load('src/utils/doctorReport.ts');
const { summarizeToday } = load('src/utils/today.ts');
const { findRepeatedMealObservation } = load('src/utils/mealObservations.ts');

function sourceFiles(directory = path.resolve('src')) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? sourceFiles(file) : /\.(tsx?|jsx?|css)$/.test(file) ? [file] : [];
  });
}

test('all tool hashes resolve, while document anchors preserve the current tool', () => {
  for (const section of NAVIGATION_SECTIONS) assert.equal(sectionFromHash(`#${section}`), section);
  for (const anchor of ['#main-content', '#discover', '#unknown', '']) assert.equal(sectionFromHash(anchor), null);
});

test('local entry dates preserve the Indian calendar day across UTC midnight', () => {
  const previous = process.env.TZ;
  process.env.TZ = 'Asia/Kolkata';
  try {
    const inputs = localDateTimeInputs(new Date('2026-11-08T20:45:00Z'));
    assert.deepEqual(inputs, { date: '2026-11-09', time: '02:15' });
    assert.equal(parseLocalDateTime(inputs.date, inputs.time).toISOString(), '2026-11-08T20:45:00.000Z');
    for (const [date, time] of [['2026-02-30', '12:00'], ['2026-11-08', '24:00'], ['', '12:00'], ['2026-11-08', 'invalid']]) {
      assert.equal(parseLocalDateTime(date, time), null);
    }
  } finally { if (previous === undefined) delete process.env.TZ; else process.env.TZ = previous; }
});

test('report calculations honor the configured range and exclude invalid, future and sample readings', () => {
  const now = new Date('2026-11-08T18:00:00Z');
  const readings = Array.from({ length: 145 }, (_, index) => ({
    id: String(index), value: 75, timestamp: new Date(now.getTime() - index * 300000).toISOString(),
  }));
  const report = buildReport([...readings,
    { id: 'future', value: 100, timestamp: new Date(now.getTime() + 300000).toISOString() },
    { id: 'bad', value: 700, timestamp: now.toISOString() },
    { id: 'sample', value: 100, timestamp: now.toISOString(), isDemo: true },
  ], [], [], 14, now, { low: 80, high: 160 });
  assert.equal(report.readingCount, 145);
  assert.equal(report.tir.hasSufficientData, true);
  assert.equal(report.tir.timeBelowRangePercent, 100);
  assert.equal(report.daily.reduce((sum, day) => sum + day.lows, 0), 145);
  const sparse = buildReport(readings.slice(0, 2), [], [], 14, now);
  assert.equal(sparse.tir.hasSufficientData, false);
});

test('today counts exclude demo and future logs and use the saved target range', () => {
  const now = new Date(2026, 10, 8, 12);
  const stamp = new Date(2026, 10, 8, 10).toISOString();
  const result = summarizeToday([
    { value: 75, timestamp: stamp }, { value: 50, timestamp: stamp, isDemo: true },
    { value: 50, timestamp: new Date(2026, 10, 8, 13).toISOString() },
  ], [{ timestamp: stamp, totalCarbs: 100, isDemo: true }], [], now, { low: 80, high: 160 });
  assert.equal(result.readingCount, 1);
  assert.equal(result.lowCount, 1);
  assert.equal(result.carbsTotal, 0);
});

test('meal observations preserve decreases and count each food only once per meal', () => {
  const meals = [], readings = [];
  for (let day = 1; day <= 5; day++) {
    const time = new Date(2026, 10, day, 12).getTime();
    meals.push({ timestamp: new Date(time).toISOString(), name: 'Rice', items: [{ name: 'Rice' }, { name: ' rice ' }] });
    readings.push({ timestamp: new Date(time - 600000).toISOString(), value: 150 }, { timestamp: new Date(time + 7200000).toISOString(), value: 100 });
  }
  assert.equal(findRepeatedMealObservation(meals.slice(0, 4), readings), null);
  const result = findRepeatedMealObservation(meals, readings);
  assert.equal(result.count, 5);
  assert.equal(result.averageChange, -50);
  assert.equal(findRepeatedMealObservation(meals.map(m => ({ ...m, isDemo: true })), readings), null);
});

test('every referenced local image and manifest icon exists', () => {
  for (const file of sourceFiles()) {
    const text = fs.readFileSync(file, 'utf8');
    for (const match of text.matchAll(/\/images\/[a-zA-Z0-9_./-]+\.(?:png|jpg|svg|webp)/g)) {
      assert.ok(fs.existsSync(path.join('public', match[0])), `${path.relative(process.cwd(), file)}: ${match[0]}`);
    }
  }
  const manifest = JSON.parse(fs.readFileSync('public/manifest.json', 'utf8'));
  for (const icon of manifest.icons) assert.ok(fs.existsSync(path.join('public', icon.src)), icon.src);
});

test('CSS module references resolve to declared classes', () => {
  for (const file of sourceFiles().filter(f => /\.[jt]sx$/.test(f))) {
    const text = fs.readFileSync(file, 'utf8');
    const imported = text.match(/import styles from ['"](.+\.module\.css)['"]/);
    if (!imported) continue;
    const css = fs.readFileSync(path.resolve(path.dirname(file), imported[1]), 'utf8');
    for (const match of text.matchAll(/styles\.([a-zA-Z][a-zA-Z0-9_]*)/g)) {
      assert.match(css, new RegExp(`\\.${match[1]}(?![a-zA-Z0-9_-])`), `${path.basename(file)}: ${match[1]}`);
    }
  }
});

test('light hover text/surfaces have explicit dark-mode counterparts', () => {
  for (const file of sourceFiles().filter(f => /\.[jt]sx$/.test(f))) {
    for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
      if (/(?<![\w:-])hover:text-slate-[6-9]00/.test(line)) assert.match(line, /dark:hover:text-/, path.basename(file));
      if (/(?<![\w:-])hover:bg-(?:slate|nest|amber|emerald|indigo|rose)-(?:50|100|200)(?!\d)/.test(line)) assert.match(line, /dark:hover:bg-/, `${path.basename(file)}: ${line.trim()}`);
    }
  }
});

test('all source modules are reachable from app entry points', () => {
  const root = process.cwd();
  const files = sourceFiles().filter(f => /\.[jt]sx?$/.test(f));
  const config = ts.parseJsonConfigFileContent(ts.readConfigFile('tsconfig.json', ts.sys.readFile).config, ts.sys, root).options;
  const seen = new Set();
  function visit(filename) {
    const file = path.resolve(filename);
    if (seen.has(file)) return;
    seen.add(file);
    const source = fs.readFileSync(file, 'utf8');
    assert.ok(source.trim(), `Empty source module: ${file}`);
    for (const imported of ts.preProcessFile(source, true, true).importedFiles) {
      const resolved = ts.resolveModuleName(imported.fileName, file, config, ts.sys).resolvedModule;
      if (resolved && path.resolve(resolved.resolvedFileName).startsWith(path.join(root, 'src'))) visit(resolved.resolvedFileName);
    }
  }
  files.filter(f => f.includes(path.sep + 'app' + path.sep)).forEach(visit);
  assert.deepEqual(files.filter(f => !seen.has(f)).map(f => path.relative(root, f)), []);
});
