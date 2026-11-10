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

async function mount(t, blocked = false) {
  const dom = new JSDOM('<main id="root"></main>', { url: 'https://gluconest.test/#food-library', pretendToBeVisual: true });
  global.window = dom.window;
  Object.defineProperty(global, 'navigator', { configurable: true, value: dom.window.navigator });
  global.document = window.document;
  global.HTMLElement = window.HTMLElement;
  global.requestAnimationFrame = window.requestAnimationFrame.bind(window);
  global.cancelAnimationFrame = window.cancelAnimationFrame.bind(window);
  global.IS_REACT_ACT_ENVIRONMENT = true;
  window.matchMedia = () => ({ matches: false });
  window.scrollTo = () => {};
  if (blocked) window.localStorage.setItem('gluconest_meals', 'invalid');
  const { createRoot } = require('react-dom/client');
  const { AppProvider, useApp } = require('../src/context/AppContext.tsx');
  const Library = require('../src/components/food/FoodLibrarySection.tsx').default;
  let app;
  function ReadContext() {
    app = useApp();
    return React.createElement(Library);
  }
  const root = createRoot(document.getElementById('root'));
  t.after(async () => { await React.act(async () => root.unmount()); dom.window.close(); });
  await React.act(async () => root.render(React.createElement(AppProvider, null, React.createElement(ReadContext))));
  return () => app;
}

const find = selector => document.querySelector(selector);
const dishes = () => Array.from(document.querySelectorAll('button[aria-haspopup="dialog"]'));
const click = element => React.act(async () => { assert.ok(element); element.focus(); element.click(); });
const button = text => Array.from(document.querySelectorAll('button')).find(item => item.textContent === text);
async function change(field, value) {
  const prototype = field.tagName === 'SELECT' ? window.HTMLSelectElement.prototype : window.HTMLInputElement.prototype;
  await React.act(async () => {
    Object.getOwnPropertyDescriptor(prototype, 'value').set.call(field, value);
    field.dispatchEvent(new window.Event(field.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true }));
  });
}

test('all foods remain reachable across pages and regional search resets pagination', async t => {
  await mount(t);
  const { indianFoodDatabase } = require('../src/data/indianFoods.ts');
  const reached = [];
  while (true) {
    assert.ok(dishes().length <= 6);
    reached.push(...dishes().map(dish => dish.querySelector('strong').textContent));
    const next = find('[aria-label="Next foods"]');
    if (next.disabled) break;
    await click(next);
  }
  assert.deepEqual(reached, indianFoodDatabase.map(food => food.name.split(' (')[0]));
  await change(find('input[type=search]'), 'इडली');
  assert.equal(dishes().length, 1);
  assert.match(dishes()[0].textContent, /Idli/);
  await click(Array.from(document.querySelectorAll('[role="radio"]')).find(option => option.textContent === 'Fruits'));
  assert.equal(dishes().length, 0);
  await click(button('Show all foods'));
  assert.equal(dishes().length, 6);
});

test('portions, plate editing and meal type persist through the real log flow', async t => {
  const app = await mount(t);
  const row = dishes()[0];
  await click(row);
  const dialog = find('[role="dialog"]');
  assert.match(dialog.textContent, /IFCT/);
  await change(find('input[type=number]'), '21');
  assert.equal(button('Add to plate').disabled, true);
  await click(button('1.5×'));
  assert.equal(find('output').textContent, '18 g');
  await click(button('Add to plate'));
  assert.equal(find('[role="dialog"]'), null);
  assert.equal(document.activeElement, row);
  await click(find('[aria-controls="plate-content"]'));
  await click(find('[aria-label^="Increase servings"]'));
  await click(find('[aria-label^="Decrease servings"]'));
  await change(find('#plate-content select'), 'lunch');
  await click(button('Save meal to Quick Log'));
  const [meal] = JSON.parse(window.localStorage.getItem('gluconest_meals'));
  assert.equal(meal.mealType, 'lunch');
  assert.equal(meal.items[0].foodId, 'food-idli');
  assert.equal(meal.items[0].servings, 1.5);
  assert.equal(meal.totalCarbs, 18);
  assert.equal(app().mealPlate.length, 0);
  await click(button('View in Quick Log'));
  assert.equal(window.location.hash, '#quick-log');
});

test('a blocked meal save leaves the log unchanged and the plate available to retry', async t => {
  const app = await mount(t, true);
  await click(dishes()[0]);
  await click(button('Add to plate'));
  await click(button('Save meal to Quick Log'));
  assert.equal(app().meals.filter(meal => !meal.isDemo).length, 0);
  assert.equal(window.localStorage.getItem('gluconest_meals'), 'invalid');
  assert.equal(app().mealPlate.length, 1);
  assert.ok(button('Save meal to Quick Log'));
  assert.match(document.body.textContent, /Meal could not be saved/);
  await click(button('Open Devices & Data'));
  assert.equal(window.location.hash, '#devices');
});
