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
const { faqItems } = require(path.resolve('src/data/faq.ts'));
const css = fs.readFileSync('src/components/home/FaqSection.module.css', 'utf8');
let FaqSection;

async function mount(_width, options = {}) {
  if (!FaqSection) {
    const icons = await import('lucide-react');
    const originalLoad = Module._load;
    Module._load = function (request, ...args) { return request === 'lucide-react' ? icons : originalLoad.call(this, request, ...args); };
    FaqSection = require(path.resolve('src/components/home/FaqSection.tsx')).default;
  }
  const dom = new JSDOM('<!doctype html><html lang="en"><head><title>Saathweft FAQ test</title></head><body><main><h1>Saathweft</h1><div id="root"></div></main></body></html>', {
    url: 'https://gluconest.test/', pretendToBeVisual: true, runScripts: 'outside-only',
  });
  global.window = dom.window;
  global.document = dom.window.document;
  global.HTMLElement = dom.window.HTMLElement;
  global.Node = dom.window.Node;
  global.IS_REACT_ACT_ENVIRONMENT = true;
  const style = dom.window.document.createElement('style');
  style.textContent = css.replaceAll(':global(.dark)', '.dark');
  dom.window.document.head.append(style);
  const { createRoot } = require('react-dom/client');
  const root = createRoot(dom.window.document.getElementById('root'));
  await act(async () => root.render(React.createElement(FaqSection, options)));
  return {
    dom,
    click: async element => act(async () => element.click()),
    close: async () => { await act(async () => root.unmount()); dom.window.close(); },
  };
}

test('FAQ data preserves the requested answer wording', () => {
  const expected = {
    account: 'No. You can explore the sample dashboard and start logging without signing up. Your personal logs are saved in this browser.',
    data: 'Manually entered records stay in local browser storage. This storage is unencrypted and can be cleared, so export private backups in Devices & Data. Nightscout credentials are held in memory only.',
    dosing: 'No. GlucoNest is an educational self-tracking tool. It does not calculate insulin doses, provide medical advice, or replace your care team or CGM alarms.',
  };
  assert.deepEqual(faqItems.map(item => item.id), ['dosing', 'data', 'account']);
  for (const item of faqItems) {
    assert.equal(item.answer, expected[item.id]);
  }
});

test('FAQ retains the summary cards and removes the accordion and its reserved space', async () => {
  const view = await mount(360);
  try {
    assert.deepEqual([...document.querySelectorAll('article h3')].map(node => node.textContent), faqItems.map(item => item.question));
    assert.equal(document.querySelector('button[aria-controls]'), null);
    assert.equal(document.querySelector('[role="region"]'), null);
    assert.equal(document.querySelector('[style*="min-block-size"]'), null);
    assert.equal(document.querySelector('script[type="application/ld+json"]'), null);
  } finally { await view.close(); }
});

test('Export a backup is visible outside the accordion and navigates to Devices & Data', async () => {
  let destination;
  const view = await mount(360, { onNavigate: section => { destination = section; } });
  try {
    const link = document.querySelector('article a');
    assert.equal(link.textContent, 'Export a backup');
    assert.equal(link.getAttribute('href'), '#devices');
    assert.equal(link.closest('[aria-hidden="true"]'), null);
    await view.click(link);
    assert.equal(destination, 'devices');
  } finally { await view.close(); }
});

test('FAQ body, summary and link tokens meet WCAG AA in both color schemes', () => {
  const palette = source => Object.fromEntries([...source.matchAll(/--faq-([\w-]+):\s*(#[\da-f]{6})/gi)].map(match => [match[1], match[2]]));
  const luminance = hex => {
    const rgb = [1, 3, 5].map(index => parseInt(hex.slice(index, index + 2), 16) / 255).map(channel => channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4);
    return rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722;
  };
  const ratio = (a, b) => (Math.max(luminance(a), luminance(b)) + .05) / (Math.min(luminance(a), luminance(b)) + .05);
  const light = palette(css.slice(0, css.indexOf('.heading')));
  const dark = palette(css.match(/:global\(\.dark\) \.faq \{([^}]+)\}/)[1]);
  for (const colors of [light, dark]) {
    for (const foreground of ['ink', 'body', 'link', 'hover']) {
      for (const background of ['canvas', 'surface', 'highlight']) {
        assert.ok(ratio(colors[foreground], colors[background]) >= 4.5, `${foreground} on ${background}`);
      }
    }
    assert.ok(ratio(colors.focus, colors.canvas) >= 3);
  }
});

test('axe finds no WCAG A/AA structural violations in the FAQ cards', async () => {
  const view = await mount(360);
  try {
    view.dom.window.eval(axe.source);
    const results = await view.dom.window.axe.run(document, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] },
      // jsdom has no rendered layout; token contrast is tested separately.
      rules: { 'color-contrast': { enabled: false } },
    });
    assert.equal(results.violations.length, 0, JSON.stringify(results.violations));
  } finally { await view.close(); }
});
