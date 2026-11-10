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


const { getPublishedMembers } = require('../src/data/teamMembers.ts');
const member = {
  id: 'example', firstName: 'Example', tagline: 'Add tagline here', role: 'Builder',
  diagnosedNote: 'Diagnosed at ___', consent: true,
  story: { whoIAm: 'First part', myJourney: 'Second part', whatHelped: 'Third part', adviceForNewlyDiagnosed: 'Fourth part' },
};

test('only explicitly consented stories enter the public list', () => {
  assert.deepEqual(getPublishedMembers([member, { ...member, consent: false }, { ...member, consent: undefined }]), [member]);
});

test('story cards, modal navigation, keyboard focus and dismissal', async t => {
  const dom = new JSDOM('<html lang="en"><head><title>Stories</title></head><body><main id="root"></main></body></html>', {
    url: 'https://gluconest.test/#about', pretendToBeVisual: true, runScripts: 'outside-only',
  });
  global.window = dom.window;
  global.document = window.document;
  global.HTMLElement = window.HTMLElement;
  global.Node = window.Node;
  global.IS_REACT_ACT_ENVIRONMENT = true;
  global.requestAnimationFrame = window.requestAnimationFrame.bind(window);
  global.cancelAnimationFrame = window.cancelAnimationFrame.bind(window);
  const motion = new window.EventTarget();
  motion.matches = true;
  window.matchMedia = () => motion;
  // jsdom has no layout. The focus hook checks the visibility of controls.
  window.HTMLElement.prototype.getClientRects = () => [{ width: 44, height: 44 }];
  const root = require('react-dom/client').createRoot(document.querySelector('main'));
  t.after(async () => { await React.act(async () => root.unmount()); dom.window.close(); });
  const Team = require('../src/components/about/TeamSection.tsx').default;
  const render = members => React.act(async () => root.render(React.createElement(Team, { members })));
  const click = element => React.act(async () => element.click());
  const key = (key, shiftKey = false) => React.act(async () =>
    document.activeElement.dispatchEvent(new window.KeyboardEvent('keydown', { key, shiftKey, bubbles: true, cancelable: true })));
  const cards = () => document.querySelectorAll('button[aria-haspopup="dialog"]');
  const dialog = () => document.querySelector('[role="dialog"]');
  await render([]);
  assert.equal(document.querySelector('section'), null);
  await render([{ ...member, photo: '/example-portrait.jpg' }]);
  const portrait = document.querySelector('article img');
  assert.equal(portrait.alt, 'Portrait of Example');
  await React.act(async () => portrait.dispatchEvent(new window.Event('error')));
  assert.equal(document.querySelector('article img'), null);
  assert.equal(document.querySelector('article span[aria-hidden="true"]').textContent, 'E');
  const card = document.querySelector('article');
  card.getBoundingClientRect = () => ({ left: 0, top: 0, width: 300, height: 400 });
  const move = () => card.dispatchEvent(new window.MouseEvent('pointermove', { clientX: 250, clientY: 20 }));
  move();
  await new Promise(resolve => window.requestAnimationFrame(() => window.requestAnimationFrame(resolve)));
  assert.ok(Number(card.style.getPropertyValue('--tilt-x')) > 0);
  motion.matches = false;
  motion.dispatchEvent(new window.Event('change'));
  move();
  assert.equal(card.style.getPropertyValue('--tilt-x'), '');
  await render([member]);
  await click(cards()[0]);
  assert.equal(dialog().querySelector('nav'), null);
  await click(dialog().querySelector('button[aria-label="Close story"]'));
  for (const count of [5, 6, 8]) {
    await render(Array.from({ length: count }, (_, i) => ({ ...member, id: String(i), firstName: 'Member ' + (i + 1) })));
    assert.equal(cards().length, count);
  }
  const trigger = cards()[7];
  await click(trigger);
  await new Promise(resolve => window.requestAnimationFrame(resolve));
  const close = dialog().querySelector('button');
  const next = dialog().querySelector('nav button:last-child');
  assert.equal(document.activeElement, close);
  assert.equal(document.body.style.overflow, 'hidden');
  await key('Tab', true);
  assert.equal(document.activeElement, next);
  await key('Tab');
  assert.equal(document.activeElement, close);
  await click(next);
  assert.match(document.getElementById(dialog().getAttribute('aria-labelledby')).textContent, /Member 1/);
  await click(dialog().querySelector('nav button'));
  assert.match(dialog().textContent, /Member 8/);
  for (const value of Object.values(member.story)) assert.ok(dialog().textContent.includes(value));
  assert.equal(dialog().querySelector('blockquote').textContent, member.story.adviceForNewlyDiagnosed);
  await key('Escape');
  assert.equal(dialog(), null);
  assert.equal(document.activeElement, trigger);
  assert.equal(document.body.style.overflow, '');
  await click(trigger);
  await click(dialog().querySelector('blockquote'));
  assert.ok(dialog());
  await click(dialog().parentElement);
  assert.equal(dialog(), null);
  assert.equal(document.activeElement, trigger);
});
