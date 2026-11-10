const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const test = require('node:test');
const ts = require('typescript');
const React = require('react');
const { JSDOM } = require('jsdom');

const originalResolve = Module._resolveFilename;
Module._resolveFilename = function (request, ...args) {
  return originalResolve.call(this, request.startsWith('@/') ? path.resolve('src', request.slice(2)) : request, ...args);
};
for (const extension of ['.tsx', '.ts']) {
  require.extensions[extension] = (module, filename) => {
    const { outputText } = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
      fileName: filename,
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
    });
    module._compile(outputText, filename);
  };
}
require.extensions['.css'] = module => { module.exports = {}; };

test.before(async () => {
  const icons = await import('lucide-react');
  const load = Module._load;
  Module._load = function (request, ...args) {
    return request === 'lucide-react' ? icons : load.call(this, request, ...args);
  };
});

async function mount(t, component, setup) {
  const dom = new JSDOM('<main id="root"></main>', { url: 'https://gluconest.test/', pretendToBeVisual: true });
  global.window = dom.window;
  global.document = window.document;
  global.HTMLElement = window.HTMLElement;
  global.requestAnimationFrame = window.requestAnimationFrame.bind(window);
  global.cancelAnimationFrame = window.cancelAnimationFrame.bind(window);
  global.IS_REACT_ACT_ENVIRONMENT = true;
  window.matchMedia = () => ({ matches: false });
  window.scrollTo = () => {};
  setup?.();
  const { createRoot } = require('react-dom/client');
  const { AppProvider, useApp } = require('../src/context/AppContext.tsx');
  const View = component && require(component).default;
  let app;
  function ReadContext() {
    app = useApp();
    return View ? React.createElement(View) : null;
  }
  const root = createRoot(document.getElementById('root'));
  t.after(async () => { await React.act(async () => root.unmount()); dom.window.close(); });
  await React.act(async () => root.render(React.createElement(AppProvider, null, React.createElement(ReadContext))));
  return () => app;
}

const collections = [
  ['meals', 'addMealLog', 'updateMealLog', 'gluconest_meals'],
  ['insulinLogs', 'addInsulinLog', 'updateInsulinLog', 'gluconest_insulin'],
  ['activityLogs', 'addActivityLog', null, 'gluconest_activity'],
];

test('Quick Log shows samples without delete controls until personal entries of each kind exist', async t => {
  const app = await mount(t, '../src/components/quicklog/QuickLogSection.tsx');
  assert.match(document.body.textContent, /SAMPLE RECORD/);
  const deletes = () => document.querySelectorAll('[title="Delete record"]').length;
  assert.equal(deletes(), 0);
  for (const [collection, add] of collections) {
    await React.act(() => app()[add]({ ...app()[collection][0], notes: 'personal ' + collection }));
    assert.ok(document.body.textContent.includes('personal ' + collection));
  }
  assert.doesNotMatch(document.body.textContent, /SAMPLE RECORD/);
  assert.equal(deletes(), 3);
});

test('collection writes use the last successful write in the same tick and leave state intact on failure', async t => {
  const app = await mount(t);
  const api = app();
  for (const [collection, add, update, key] of [
    ...collections, ['manualReadings', 'addReading', null, 'gluconest_manual_readings'],
    ['feedbackList', 'submitFeedback', null, 'gluconest_feedback'],
  ]) {
    const entry = { ...api[collection][0], timestamp: new Date().toISOString(), value: 110, source: 'manual' };
    await React.act(() => {
      assert.equal(api[add]({ ...entry, notes: 'first' }), true);
      assert.equal(api[add]({ ...entry, notes: 'second' }), true);
    });
    const before = app()[collection];
    const saved = window.localStorage.getItem(key);
    assert.deepEqual(JSON.parse(saved).map(x => x.notes).sort(), ['first', 'second']);
    assert.deepEqual(before.filter(x => !x.isDemo).map(x => x.notes).sort(), ['first', 'second']);
    const broken = t.mock.method(window.Storage.prototype, 'setItem', () => { throw new Error('quota'); });
    await React.act(() => {
      assert.equal(api[add](entry), false);
      if (update) assert.equal(api[update](before.find(x => !x.isDemo).id, { notes: 'failed' }), false);
    });
    broken.mock.restore();
    assert.equal(app()[collection], before);
    assert.equal(window.localStorage.getItem(key), saved);
  }
});

test('a second Nightscout connect reports the active fetch; disconnect restores all demo readings', async t => {
  const app = await mount(t);
  let finish;
  const fetch = t.mock.method(global, 'fetch', () => new Promise(resolve => { finish = resolve; }));
  await React.act(() => { app().addReading({ ...app().readings[0], id: 'extra-demo' }); });
  const original = app().readings;
  const config = { url: 'https://example.test', historyLimit: 24 };
  let first;
  await React.act(async () => {
    first = app().connectNightscout(config);
    await app().connectNightscout(config);
  });
  assert.equal(fetch.mock.callCount(), 1);
  assert.equal(app().connectionError, 'A Nightscout request is already in progress. Wait for it to finish or cancel it.');
  await React.act(async () => {
    finish(Response.json(require('../tests/fixtures/nightscout-entries.json')));
    await first;
  });
  assert.equal(app().dataSource, 'nightscout');
  assert.equal(app().connectionError, null);
  await React.act(() => app().disconnectNightscout());
  assert.equal(app().dataSource, 'demo');
  assert.equal(app().readings, original);
});

test('invalid reminder JSON reports an error and returns disabled defaults; notice follows language', async t => {
  const { REMINDER_STORAGE_KEY, readReminderSettings, DEFAULT_REMINDER_SETTINGS } = require('../src/lib/reminders.ts');
  const app = await mount(t, '../src/components/devices/ReminderSettings.tsx', () => {
    window.localStorage.setItem(REMINDER_STORAGE_KEY, '{');
  });
  assert.match(document.querySelector('[role="alert"]').textContent, /invalid/);
  assert.deepEqual(readReminderSettings(() => {}), DEFAULT_REMINDER_SETTINGS);
  assert.equal(window.localStorage.getItem(REMINDER_STORAGE_KEY), '{');
  const { APP_LANGUAGES, translate } = require('../src/lib/i18n.ts');
  const notices = new Set();
  for (const { code } of APP_LANGUAGES) {
    await React.act(() => app().setLanguage(code));
    const notice = translate(code, 'reminders.openOnly');
    notices.add(notice);
    assert.ok(document.body.textContent.includes(notice));
  }
  assert.equal(notices.size, APP_LANGUAGES.length);
});

test('all record prefixes produce 1000 unique IDs in one millisecond, including without randomUUID', t => {
  const { recordId } = require('../src/utils/recordId.ts');
  t.mock.method(Date, 'now', () => 123456);
  for (const fallback of [false, true]) {
    if (fallback) t.mock.method(globalThis.crypto, 'randomUUID', () => undefined);
    for (const prefix of ['meal', 'ins', 'act', 'g-manual', 'fb', 'csv']) {
      const ids = Array.from({ length: 1000 }, () => recordId(prefix));
      assert.ok(ids.every(id => id.startsWith(prefix + '-')));
      assert.equal(new Set(ids).size, 1000);
    }
  }
});

test('Next supplies the header policy for all paths without a competing static policy', async () => {
  assert.equal(fs.existsSync('public/_headers'), false);
  const { default: config } = await import('../next.config.mjs');
  const rules = await config.headers();
  assert.ok(rules.some(rule => rule.source === '/:path*' && rule.headers.some(h => h.key === 'Content-Security-Policy')));
});

test('TIR still gives the final reading no bucket time when a qualifying interval exists', () => {
  const { calculateDetailedTIR } = require('../src/utils/tirCalculator.ts');
  const result = calculateDetailedTIR([
    { timestamp: '2026-01-01T00:00:00Z', value: 110 },
    { timestamp: '2026-01-01T00:05:00Z', value: 200 },
  ]);
  assert.equal(result.coverageMinutes, 5);
  assert.equal(result.inRangePercent, 100);
  assert.equal(result.meanGlucose, 155);
});
