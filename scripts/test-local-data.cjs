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
  const loadedModule = { exports: {} };
  new Function('exports', 'require', 'module', javascript)(
    loadedModule.exports,
    require,
    loadedModule
  );
  return loadedModule.exports;
}

const localData = loadTypeScriptModule('src/lib/localData.ts');

const meal = {
  id: 'meal-user-1',
  timestamp: '2026-11-04T10:00:00.000Z',
  mealType: 'lunch',
  name: 'Lunch',
  items: [{
    foodId: 'custom',
    name: 'Rice',
    servings: 1,
    servingDescription: 'one portion',
    carbsPerServing: 35,
    totalCarbs: 35,
  }],
  totalCarbs: 35,
  isDemo: false,
};

const insulin = {
  id: 'ins-user-1',
  timestamp: '2026-11-04T10:05:00.000Z',
  type: 'rapid',
  units: 2,
  deliveryMethod: 'pen',
  isDemo: false,
};

const activity = {
  id: 'act-user-1',
  timestamp: '2026-11-04T11:00:00.000Z',
  type: 'walk',
  durationMinutes: 20,
  intensity: 'light',
  isDemo: false,
};

const reading = {
  id: 'glucose-user-1',
  timestamp: '2026-11-04T12:00:00.000Z',
  timeLabel: '12:00 PM',
  value: 120,
  source: 'manual',
  isDemo: false,
};

test('validates stored log shapes and rejects malformed records', () => {
  assert.equal(localData.isMealLogEntry(meal), true);
  assert.equal(localData.isInsulinLogEntry(insulin), true);
  assert.equal(localData.isActivityLogEntry(activity), true);
  assert.equal(localData.isManualGlucoseReading(reading), true);
  assert.equal(localData.isMealLogEntry({ ...meal, totalCarbs: '35' }), false);
  assert.equal(localData.isInsulinLogEntry({ ...insulin, units: Infinity }), false);
  assert.equal(localData.isActivityLogEntry({ ...activity, durationMinutes: -1 }), false);
  assert.equal(localData.isManualGlucoseReading({ ...reading, value: NaN }), false);
  assert.equal(localData.isArrayOf([meal, null], localData.isMealLogEntry), false);
});

test('exports and validates a versioned backup without demo records', () => {
  const backup = localData.createLocalDataBackup({
    manualReadings: [reading],
    meals: [meal, { ...meal, id: 'meal-demo', isDemo: true }],
    insulinLogs: [insulin],
    activityLogs: [activity],
    feedbackList: [],
  });

  assert.equal(backup.app, 'GlucoNest');
  assert.equal(backup.schemaVersion, 1);
  assert.equal(backup.data.meals.length, 1);
  assert.equal(backup.data.meals[0].id, meal.id);
  assert.deepEqual(localData.parseLocalDataBackup(backup), backup);
});

test('rejects unsupported, incomplete, malformed, or demo-containing backups', () => {
  assert.throws(
    () => localData.parseLocalDataBackup({ app: 'Other', schemaVersion: 1 }),
    /not a supported/
  );
  assert.throws(
    () => localData.parseLocalDataBackup({
      app: 'GlucoNest',
      schemaVersion: 1,
      exportedAt: '2026-11-04T00:00:00.000Z',
      data: { meals: [] },
    }),
    /missing or invalid/
  );

  const demoBackup = localData.createLocalDataBackup({
    manualReadings: [],
    meals: [],
    insulinLogs: [],
    activityLogs: [],
    feedbackList: [],
  });
  demoBackup.data.meals.push({ ...meal, isDemo: true });
  assert.throws(
    () => localData.parseLocalDataBackup(demoBackup),
    /sample records/
  );
});

test('merges records by ID, updating matches and retaining unmatched records', () => {
  assert.deepEqual(
    localData.mergeRecordsById(
      [{ id: 'old', value: 1 }, { id: 'same', value: 1 }],
      [{ id: 'same', value: 2 }, { id: 'new', value: 3 }]
    ),
    [{ id: 'old', value: 1 }, { id: 'same', value: 2 }, { id: 'new', value: 3 }]
  );
});

test('resetting demo collections preserves every personal record and replaces sample records', () => {
  const reset = localData.replaceDemoRecords(
    [{ id: 'real-1', isDemo: false }, { id: 'sample-old', isDemo: true }],
    [{ id: 'sample-new', isDemo: true }]
  );
  assert.deepEqual(reset, [
    { id: 'real-1', isDemo: false },
    { id: 'sample-new', isDemo: true },
  ]);
});
