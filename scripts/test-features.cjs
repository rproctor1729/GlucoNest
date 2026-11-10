const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const test = require('node:test');
const ts = require('typescript');
const React = require('react');
const { JSDOM } = require('jsdom');
const axe = require('axe-core');
const { act } = React;

// Match the project's existing Node test runner and TypeScript source loading.
const originalResolve = Module._resolveFilename;
Module._resolveFilename = function (request, ...args) {
  return originalResolve.call(this, request.startsWith('@/') ? path.resolve('src', request.slice(2)) : request, ...args);
};
for (const extension of ['.ts', '.tsx']) {
  require.extensions[extension] = (module, filename) => {
    const { outputText } = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
      fileName: filename,
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
    });
    module._compile(outputText, filename);
  };
}
require.extensions['.css'] = (module, filename) => {
  module.exports = Object.fromEntries([...fs.readFileSync(filename, 'utf8').matchAll(/\.([a-zA-Z][\w-]*)/g)].map(match => [match[1], match[1]]));
};
const { featureCopy } = require(path.resolve('src/data/featureCopy.ts'));
const { CARBOHYDRATE_DISCLAIMER } = require(path.resolve('src/data/disclaimers.ts'));
const loaders = require(path.resolve('src/lib/featurePreviews.ts'));
const { LOCAL_DATA_KEYS } = require(path.resolve('src/lib/localData.ts'));
const { mockGlucoseReadings } = require(path.resolve('src/data/mockGlucose.ts'));
const { initialMockMeals } = require(path.resolve('src/data/mockMeals.ts'));
const { indianFoodDatabase } = require(path.resolve('src/data/indianFoods.ts'));
let components;

async function initialize() {
  if (components) return;
  const icons = await import('lucide-react');
  const originalLoad = Module._load;
  Module._load = function (request, ...args) {
    return request === 'lucide-react' ? icons : originalLoad.call(this, request, ...args);
  };
  components = {
    dashboard: require(path.resolve('src/components/home/previews/DashboardPreview.tsx')).default,
    food: require(path.resolve('src/components/home/previews/FoodPreview.tsx')).default,
    section: require(path.resolve('src/components/home/FeatureSection.tsx')).default,
    faq: require(path.resolve('src/components/home/FaqSection.tsx')).default,
  };
}

async function mount(name, props = {}) {
  await initialize();
  const dom = new JSDOM('<!doctype html><html lang="en"><head><title>Feature previews</title></head><body><main><h1>GlucoNest</h1><div id="root"></div></main></body></html>', {
    url: 'https://gluconest.test/', pretendToBeVisual: true, runScripts: 'outside-only',
  });
  global.window = dom.window;
  Object.defineProperty(global, 'navigator', { configurable: true, value: dom.window.navigator });
  global.document = dom.window.document;
  global.HTMLElement = dom.window.HTMLElement;
  global.Node = dom.window.Node;
  global.IS_REACT_ACT_ENVIRONMENT = true;
  const { createRoot } = require('react-dom/client');
  const root = createRoot(document.getElementById('root'));
  await act(async () => root.render(React.createElement(components[name], props)));
  return { dom, close: async () => { await act(async () => root.unmount()); dom.window.close(); } };
}

const dataByPreview = {
  dashboard: { readings: mockGlucoseReadings, meals: initialMockMeals, sample: true },
  food: loaders.loadFoodPreview(),
};
for (const name of ['dashboard', 'food']) {
  test(`${name} preview renders its source data`, async () => {
    const view = await mount(name, { load: () => dataByPreview[name] });
    try {
      const text = document.querySelector('main').textContent;
      if (name === 'dashboard') {
        assert.ok(text.includes(featureCopy.sample));
        assert.ok(text.includes(String(mockGlucoseReadings.at(-1).value)));
        assert.ok(text.includes(initialMockMeals[0].name));
        assert.ok(document.querySelector('polyline').getAttribute('points'));
      } else {
        assert.ok(text.includes(dataByPreview.food.name));
        assert.ok(text.includes(dataByPreview.food.servingDescription));
        assert.ok(text.includes(`${dataByPreview.food.carbsGrams}g`));
        assert.ok(text.includes(dataByPreview.food.hindiName));
      }
    } finally { await view.close(); }
  });
  test(`${name} preview handles loading, empty and error`, async () => {
    let resolve;
    let view = await mount(name, { load: () => new Promise(done => { resolve = done; }) });
    try {
      assert.equal(document.querySelector('[role="status"]').getAttribute('aria-busy'), 'true');
      assert.ok(document.body.textContent.includes(featureCopy.loading));
      await act(async () => resolve(null));
      assert.ok(document.body.textContent.includes(featureCopy[`${name}Empty`]));
    } finally { await view.close(); }
    view = await mount(name, { load: () => { throw new Error('Unavailable'); } });
    try {
      assert.ok(document.body.textContent.includes(featureCopy.error));
      assert.equal(document.querySelector('[role="status"]').getAttribute('aria-busy'), 'false');
    } finally { await view.close(); }
  });
}

test('dashboard uses only today personal local logs, excludes future/demo, and sorts by time', () => {
  const now = new Date(2026, 10, 9, 18);
  const stamp = hour => new Date(2026, 10, 9, hour).toISOString();
  const reading = (id, hour, value) => ({ id, timestamp: stamp(hour), timeLabel: `${hour}:00`, value, source: 'manual' });
  const personalMeal = { ...initialMockMeals[0], id: 'personal', timestamp: stamp(12), isDemo: false };
  const records = {
    [LOCAL_DATA_KEYS.readings]: [reading('late', 16, 140), reading('early', 8, 90), reading('future', 20, 200)],
    [LOCAL_DATA_KEYS.meals]: [personalMeal, initialMockMeals[1]],
  };
  const result = loaders.loadDashboardPreview({ getItem: key => JSON.stringify(records[key]) }, now);
  assert.equal(result.sample, false);
  assert.deepEqual(result.readings.map(reading => reading.id), ['early', 'late']);
  assert.deepEqual(result.meals.map(meal => meal.id), ['personal']);
  const empty = loaders.loadDashboardPreview({ getItem: () => null }, now);
  assert.equal(empty.sample, true);
  assert.equal(empty.readings, mockGlucoseReadings);
  assert.equal(empty.meals, initialMockMeals);
});

test('dashboard never silently replaces inaccessible or malformed storage with sample values', () => {
  assert.throws(() => loaders.loadDashboardPreview({ getItem: () => '{broken' }));
  assert.throws(() => loaders.loadDashboardPreview({ getItem: () => JSON.stringify([{ value: 100 }]) }));
  assert.throws(() => loaders.loadDashboardPreview({ getItem: () => { throw new Error('Storage denied'); } }));
});

test('dashboard shows personal meals without inventing missing glucose readings', async () => {
  const view = await mount('dashboard', { load: () => ({ readings: [], meals: [initialMockMeals[0]], sample: false }) });
  try {
    assert.ok(document.body.textContent.includes(featureCopy.noReadings));
    assert.equal(document.querySelector('polyline'), null);
    assert.ok(document.body.textContent.includes(initialMockMeals[0].name));
  } finally { await view.close(); }
});

test('source adapters handle empty sources and single/flat glucose traces', () => {
  assert.equal(loaders.loadFoodPreview([]), null);
  assert.equal(loaders.sparklinePoints([]), '');
  assert.equal(loaders.sparklinePoints([mockGlucoseReadings[0]]), '160,40');
  assert.ok(!loaders.sparklinePoints([mockGlucoseReadings[0], { ...mockGlucoseReadings[1], value: mockGlucoseReadings[0].value }]).includes('NaN'));
  assert.equal(dataByPreview.food, indianFoodDatabase[0]);
});

test('feature titles/descriptions remain verbatim and every entry is one native link in keyboard order', async () => {
  let destination;
  const view = await mount('section', { onNavigate: section => { destination = section; } });
  try {
    const { features } = require(path.resolve('src/data/features.ts'));
    assert.deepEqual(features.map(feature => feature.title), ['See the bigger picture.', 'Your plate. Your culture. Your everyday.']);
    assert.deepEqual(features.map(feature => feature.description), [
      'Bring glucose readings, meals, and activity into one place. Give your everyday numbers a little more context.',
      "Food tracking should feel familiar. Browse Indian meals, adjust your portions, and keep a simple record of what's on your plate.",
    ]);
    const links = [...document.querySelectorAll('#discover > a')];
    assert.deepEqual(links.map(link => link.getAttribute('href')), ['#my-day', '#food-library']);
    assert.equal(document.querySelectorAll('#discover a').length, 2);
    assert.equal(document.querySelector('#discover button, #discover input, #discover [tabindex]'), null);
    for (const [index, link] of links.entries()) {
      assert.equal(link.tabIndex, 0);
      link.focus();
      assert.equal(document.activeElement, link);
      assert.equal(document.getElementById(link.getAttribute('aria-labelledby')).textContent, features[index].title);
      const event = new view.dom.window.MouseEvent('click', { bubbles: true, cancelable: true, button: 0 });
      await act(async () => link.dispatchEvent(event));
      assert.equal(event.defaultPrevented, true);
      assert.equal(destination, features[index].href.slice(1));
      const modified = new view.dom.window.MouseEvent('click', { bubbles: true, cancelable: true, button: 0, ctrlKey: true });
      await act(async () => link.dispatchEvent(modified));
      assert.equal(modified.defaultPrevented, false);
    }
    assert.equal(document.querySelector('#discover .disclaimer').textContent, CARBOHYDRATE_DISCLAIMER);
    const image = document.querySelector('#discover img');
    assert.equal(image.getAttribute('loading'), 'lazy');
    assert.equal(image.getAttribute('width'), '1254');
    assert.equal(image.getAttribute('height'), '1254');
    assert.ok(image.getAttribute('srcset'));
    assert.ok(image.getAttribute('sizes'));
    assert.equal(image.getAttribute('alt'), featureCopy.foodAlt);
    assert.ok(document.body.textContent.includes(featureCopy.foodCaption));
  } finally { await view.close(); }
});

test('feature preview SSR is stable and does not read browser storage', async () => {
  await initialize();
  const { renderToString } = require('react-dom/server');
  delete global.window;
  for (const name of ['dashboard', 'food']) {
    const markup = renderToString(React.createElement(components[name]));
    assert.ok(markup.includes(featureCopy.loading));
    assert.ok(!markup.includes('NaN'));
  }
});

test('feature text tokens meet AA in light/dark and motion/focus rules are explicit', () => {
  const css = fs.readFileSync('src/components/home/FeatureSection.module.css', 'utf8');
  const palette = source => Object.fromEntries([...source.matchAll(/--feature-([\w-]+):\s*(#[\da-f]{6})/gi)].map(match => [match[1], match[2]]));
  const luminance = hex => {
    const channels = [1,3,5].map(i => parseInt(hex.slice(i,i+2),16)/255).map(x => x <= .04045 ? x/12.92 : ((x+.055)/1.055)**2.4);
    return channels[0]*.2126+channels[1]*.7152+channels[2]*.0722;
  };
  for (const colors of [palette(css.slice(0,css.indexOf('.card {'))), palette(css.match(/:global\(\.dark\) \.features \{([^}]+)\}/)[1])]) {
    for (const foreground of ['ink','body','accent']) for (const background of ['surface','soft']) {
      const a=luminance(colors[foreground]),b=luminance(colors[background]);
      assert.ok((Math.max(a,b)+.05)/(Math.min(a,b)+.05)>=4.5, `${foreground} on ${background}`);
    }
  }
  assert.match(css, /\.card:focus-visible/);
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.match(css, /max-width: 767px/);
});

test('axe finds no structural WCAG A/AA violations across both populated feature links', async () => {
  const view = await mount('section', { onNavigate: () => {} });
  try {
    // Axe checks for icon ligatures through canvas; jsdom has no canvas renderer.
    view.dom.window.HTMLCanvasElement.prototype.getContext = () => null;
    view.dom.window.eval(axe.source);
    const results = await view.dom.window.axe.run(document, {
      runOnly: { type: 'tag', values: ['wcag2a','wcag2aa','wcag21a','wcag21aa'] },
      rules: { 'color-contrast': { enabled: false } },
    });
    assert.equal(results.violations.length, 0, JSON.stringify(results.violations));
  } finally { await view.close(); }
});

test('FAQ uses the same shared food disclaimer wording', async () => {
  const view = await mount('faq');
  try { assert.equal(document.querySelector('.disclaimer').textContent, CARBOHYDRATE_DISCLAIMER); }
  finally { await view.close(); }
});
