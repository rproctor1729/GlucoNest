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
let Sidebar, Preferences;
let context;
function makeContext(overrides = {}) {
  return {
    activeSection: 'my-day', language: 'en', darkMode: true, glucoseUnit: 'mg/dL',
    connectionStatus: 'disconnected', localDataError: null,
    setActiveSection: () => {}, setLanguage: () => {}, toggleDarkMode: () => {}, toggleGlucoseUnit: () => {},
    ...overrides,
  };
}
async function mount(options = {}, overrides = {}) {
  context = makeContext(overrides);
  if (!Sidebar) {
    const icons = await import('lucide-react');
    const originalLoad = Module._load;
    Module._load = function (request, ...args) {
      if (request === 'lucide-react') return icons;
      if (request === '@/context/AppContext') return { useApp: () => context };
      return originalLoad.call(this, request, ...args);
    };
    Preferences = require(path.resolve('src/components/layout/Preferences.tsx')).default;
    Sidebar = require(path.resolve('src/components/layout/Sidebar.tsx')).default;
  }
  const dom = new JSDOM('<!doctype html><html lang="en"><head><title>Sidebar</title></head><body><main><h1>My Day</h1></main><div id="root"></div><button id="outside">Outside</button></body></html>', { url: 'https://gluconest.test/', pretendToBeVisual: true, runScripts: 'outside-only' });
  global.window = dom.window; global.document = dom.window.document;
  global.HTMLElement = dom.window.HTMLElement; global.Node = dom.window.Node;
  global.requestAnimationFrame = dom.window.requestAnimationFrame.bind(dom.window);
  global.cancelAnimationFrame = dom.window.cancelAnimationFrame.bind(dom.window);
  global.IS_REACT_ACT_ENVIRONMENT = true;
  dom.window.matchMedia = () => ({ matches: true });
  // Model visible controls for the focus trap; jsdom does not provide layout.
  dom.window.HTMLElement.prototype.getClientRects = function () { return [{ width: 100, height: 36 }]; };
  const { createRoot } = require('react-dom/client');
  const root = createRoot(document.getElementById('root'));
  let props = { collapsed: false, onToggleCollapsed: () => {}, open: false, onClose: () => {}, home: false, ...options };
  const render = () => root.render(React.createElement(React.Fragment, null, React.createElement(Preferences), React.createElement(Sidebar, props)));
  await act(async () => render());
  return {
    dom,
    click: element => act(async () => element.click()),
    key: (element, key, options = {}) => act(async () => element.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...options }))),
    render: async updates => { props = { ...props, ...updates }; await act(async () => render()); },
    close: async () => { await act(async () => root.unmount()); dom.window.close(); },
  };
}

test('sidebar keeps route labels/order and provides only one Log entry', async () => {
  let destination, closed = 0;
  const view = await mount({ onClose: () => closed++ }, { setActiveSection: value => { destination = value; } });
  try {
    const main = [...document.querySelectorAll('nav[aria-label="Main navigation"] a')];
    const bottom = [...document.querySelectorAll('nav[aria-label="More navigation"] a')];
    assert.deepEqual(main.map(link => link.getAttribute('href')), ['#my-day','#insights','#food-library','#knowledge-hub','#report']);
    assert.deepEqual(main.map(link => link.getAttribute('aria-label')), ['My Day','My Insights','Food Library','T1D Knowledge Hub','Doctor report']);
    assert.deepEqual(bottom.map(link => link.getAttribute('href')), ['#devices','#feedback','#about']);
    assert.equal(document.querySelectorAll('button[aria-label="Log"]').length, 1);
    assert.equal(document.querySelector('nav a[href="#quick-log"]'), null);
    assert.equal(document.querySelector('a[aria-current="page"]').getAttribute('href'), '#my-day');
    assert.ok(!document.body.textContent.includes('Back to GlucoNest'));
    assert.ok(!document.body.textContent.includes('Add a moment'));
    assert.equal(document.querySelector('.sidebar-brand img').getAttribute('class'), 'h-7 w-7 shrink-0');
    assert.equal(document.querySelector('.sidebar-brand linearGradient'), null);
    for (const link of [...main, ...bottom]) {
      await view.click(link); assert.equal(destination, link.getAttribute('href').slice(1));
      const event = new view.dom.window.MouseEvent('click', { bubbles: true, cancelable: true, ctrlKey: true });
      await act(async () => link.dispatchEvent(event)); assert.equal(event.defaultPrevented, false);
    }
    await view.click(document.querySelector('button[aria-label="Log"]'));
    assert.equal(destination, 'quick-log'); assert.equal(closed, main.length + bottom.length + 1);
  } finally { await view.close(); }
});

test('collapsed rail retains names, focus tooltips and working collapse control', async () => {
  let toggled = 0;
  const view = await mount({ collapsed: true, onToggleCollapsed: () => toggled++ });
  try {
    assert.equal(document.querySelector('.product-sidebar').dataset.collapsed, 'true');
    const link = document.querySelector('a[href="#insights"]');
    await act(async () => link.focus());
    assert.equal(document.activeElement, link);
    assert.equal(document.querySelector('[role="tooltip"]').textContent, 'My Insights');
    await view.click(document.querySelector('[aria-label="Expand sidebar"]'));
    assert.equal(toggled, 1);
    await view.render({ collapsed: false });
    assert.equal(document.querySelector('[aria-label="Collapse sidebar"]').getAttribute('aria-expanded'), 'true');
  } finally { await view.close(); }
});

test('only real connection/local-data errors show a neutral Devices attention badge', async () => {
  const view = await mount();
  try {
    assert.equal(document.querySelector('.sidebar-attention'), null);
    context = makeContext({ connectionStatus: 'error' }); await view.render({});
    assert.equal(document.querySelector('a[href="#devices"] .sidebar-attention').getAttribute('aria-label'), 'Needs attention');
    context = makeContext({ localDataError: 'Storage unavailable' }); await view.render({});
    assert.equal(document.querySelectorAll('.sidebar-attention').length, 1);
  } finally { await view.close(); }
});

test('header preferences work and Escape closes them with focus restored', async () => {
  let theme = 0, units = 0, language;
  const view = await mount({}, { toggleDarkMode: () => theme++, toggleGlucoseUnit: () => units++, setLanguage: value => { language = value; } });
  try {
    const trigger = document.querySelector('button[aria-label="Preferences"]');
    await view.click(trigger);
    assert.equal(trigger.getAttribute('aria-expanded'), 'true');
    const buttons = [...document.querySelectorAll('.preferences-panel button')];
    const hindi = buttons.find(button => button.textContent.includes('हिन्दी'));
    await view.click(hindi);
    assert.equal(language, 'hi');
    await view.click(buttons.find(button => button.textContent.includes('Light')));
    const glucoseUnit = buttons.find(button => button.textContent.trim() === 'mmol/L');
    await view.click(glucoseUnit);
    assert.equal(theme, 1); assert.equal(units, 1);
    await view.key(glucoseUnit, 'Escape');
    assert.equal(trigger.getAttribute('aria-expanded'), 'false');
    assert.equal(document.activeElement, trigger);
    await view.click(trigger);
    await act(async () => document.getElementById('outside').dispatchEvent(new view.dom.window.Event('pointerdown', { bubbles: true })));
    assert.equal(trigger.getAttribute('aria-expanded'), 'false');
  } finally { await view.close(); }
});

test('mobile drawer traps focus, closes on Escape, and restores scrolling/focus', async () => {
  let closed = 0;
  const view = await mount({ onClose: () => closed++ });
  try {
    const previous = document.getElementById('outside'); previous.focus();
    await view.render({ open: true });
    await act(async () => new Promise(resolve => setTimeout(resolve, 30)));
    const drawer = document.querySelector('[role="dialog"]');
    assert.equal(drawer.getAttribute('aria-modal'), 'true');
    assert.equal(document.body.style.overflow, 'hidden');
    const first = drawer.querySelector('a');
    assert.equal(document.activeElement, first);
    await view.key(first, 'Tab', { shiftKey: true });
    assert.equal(document.activeElement.getAttribute('aria-label'), 'Collapse sidebar');
    await view.key(document.activeElement, 'Tab'); assert.equal(document.activeElement, first);
    await view.key(first, 'Escape'); assert.equal(closed, 1);
    await view.render({ open: false });
    assert.equal(document.body.style.overflow, ''); assert.equal(document.activeElement, previous);
  } finally { await view.close(); }
});

test('sidebar text, primary and focus tokens meet contrast requirements', () => {
  const css = fs.readFileSync('src/app/globals.css','utf8');
  const sidebarColor = token => {
    const hex = css.match(new RegExp('--sidebar-' + token + ': #(\\w{6});'))[1];
    return [0, 2, 4].map(index => parseInt(hex.slice(index, index + 2), 16));
  };
  const background = sidebarColor('surface');
  const accent = sidebarColor('accent');
  const l = rgb => rgb.map(x => x/255).map(x => x <= .04045 ? x/12.92 : ((x+.055)/1.055)**2.4).reduce((sum,x,i) => sum+x*[.2126,.7152,.0722][i],0);
  const ratio = (a,b) => (Math.max(l(a),l(b))+.05)/(Math.min(l(a),l(b))+.05);
  const blend = (color,opacity,bg) => color.map((x,i) => x*opacity+bg[i]*(1-opacity));
  assert.ok(ratio(blend([255,255,255],.65,background),background)>=4.5);
  assert.ok(ratio(sidebarColor('on-accent'),accent)>=4.5);
  assert.ok(ratio(accent,background)>=3);
  assert.match(css,/--sidebar-width: 248px/); assert.match(css,/--sidebar-rail-width: 64px/);
  assert.match(css,/--sidebar-item-height: 36px/); assert.match(css,/--sidebar-item-gap: 2px/);
  assert.match(css,/color 120ms ease/); assert.match(css,/product-sidebar :is\(a, button, select\):focus-visible/);
  assert.ok(!css.split('\n').some(line => /^\s*\{/.test(line)), 'No selectorless legacy rules');
});

test('axe finds no structural violations in expanded, collapsed or open global preferences', async () => {
  const view = await mount();
  try {
    view.dom.window.HTMLCanvasElement.prototype.getContext = () => null;
    view.dom.window.eval(axe.source);
    for (const collapsed of [false,true]) {
      await view.render({ collapsed });
      const results = await view.dom.window.axe.run(document, { runOnly: { type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa'] },rules:{'color-contrast':{enabled:false}} });
      assert.equal(results.violations.length,0,JSON.stringify(results.violations));
    }
    await view.click(document.querySelector('button[aria-label="Preferences"]'));
    const results = await view.dom.window.axe.run(document,{ runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']},rules:{'color-contrast':{enabled:false}} });
    assert.equal(results.violations.length,0,JSON.stringify(results.violations));
  } finally { await view.close(); }
});
