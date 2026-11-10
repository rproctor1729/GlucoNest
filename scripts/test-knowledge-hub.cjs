const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const test = require('node:test');
const ts = require('typescript');
const React = require('react');
const { JSDOM } = require('jsdom');

const resolve = Module._resolveFilename;
Module._resolveFilename = function (name, ...args) {
  return resolve.call(this, name.startsWith('@/') ? path.resolve('src', name.slice(2)) : name, ...args);
};
for (const extension of ['.ts', '.tsx']) {
  require.extensions[extension] = (mod, filename) => {
    const { outputText } = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
      fileName: filename,
      compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
    });
    mod._compile(outputText, filename);
  };
}
require.extensions['.css'] = mod => { mod.exports = {}; };

const { topics, topicById, categories, sources, pathways, practicalGuides, guideHref, HUB, topicHref, searchTopics, relatedTopics } = require('../src/lib/knowledge.ts');
const { sectionFromHash } = require('../src/lib/navigation.ts');

test('curriculum entries have unique routes, valid sources and complete public lessons', () => {
  assert.equal(categories.length, 12);
  assert.equal(topics.length, 135);
  assert.equal(topicById.size, topics.length);
  for (const topic of topics) {
    assert.equal(sectionFromHash(topicHref(topic.id)), 'knowledge-hub');
    assert.ok(topic.sourceIds.length);
    for (const id of topic.sourceIds) {
      assert.ok(sources[id], topic.id + ': ' + id);
      assert.equal(new URL(sources[id].url).protocol, 'https:');
      assert.ok(Number.isFinite(Date.parse(sources[id].verified)));
    }
    assert.equal(relatedTopics(topic).length, 3);
    assert.ok(relatedTopics(topic).every(other => other.id !== topic.id));
    if (topic.category.id === 'emergencies') {
      assert.equal(topic.lesson, undefined);
    } else {
      for (const field of ['summary', 'why', 'how', 'example', 'caution', 'question', 'answer']) assert.ok(topic.lesson[field], topic.id + ': ' + field);
      assert.equal(topic.lesson.takeaways.length, 3);
      assert.equal(topic.category.faq.length + 1, 4);
    }
  }
  const drafts = require('../content/knowledge/emergency-drafts.json');
  assert.equal(drafts.length, 11);
  assert.deepEqual(drafts.map(draft => draft.id).sort(), topics.filter(t => !t.lesson).map(t => t.id).sort());
  for (const id of pathways.flatMap(p => p.ids)) assert.ok(topicById.get(id)?.lesson);
});

test('search understands common abbreviations and handles missing matches and combines category and text', () => {
  for (const [query, id] of Object.entries({
    ICR: 'insulin-to-carbohydrate-ratio-icr', 'correction factor': 'insulin-sensitivity-factor-isf',
    TIR: 'time-in-range-tir', DKA: 'diabetic-ketoacidosis-dka', hypo: 'hypoglycemia',
  })) assert.ok(searchTopics(query).slice(0, 5).some(topic => topic.id === id), query);
  assert.equal(searchTopics('zzzzzzzz').length, 0);
  for (const [query, expected] of [['CARBS','carbohydrate-counting'],['low sugar','hypoglycemia'],['cgM','what-is-a-cgm']]) {
    assert.equal(searchTopics(query)[0].id, expected);
  }
  assert.ok(searchTopics('power cut','injection').some(item => item.id === 'guide-insulin-storage-climate'));
  assert.ok(searchTopics('power cut','technology').every(item => item.category.id === 'technology'));
  assert.equal(practicalGuides.length, 5);
  for (const item of practicalGuides) assert.ok(searchTopics(item.title, item.category.id).some(match => match.id === item.id));
  assert.equal(sectionFromHash('#learn-community'), 'knowledge-hub');
});

test('reader navigation, guides, activities and clinical review boundary work through the hub', async t => {
  const icons = await import('lucide-react');
  const originalLoad = Module._load;
  Module._load = function (name, ...args) { return name === 'lucide-react' ? icons : originalLoad.call(this, name, ...args); };
  const dom = new JSDOM('<!doctype html><html lang="en"><head><title>Knowledge Hub</title></head><body><main></main></body></html>', {
    url: 'https://gluconest.test/' + HUB, pretendToBeVisual: true, runScripts: 'outside-only',
  });
  global.window = dom.window;
  Object.defineProperty(global, 'navigator', { configurable: true, value: dom.window.navigator });
  global.document = window.document;
  global.HTMLElement = window.HTMLElement;
  global.IS_REACT_ACT_ENVIRONMENT = true;
  window.scrollTo = () => {};
  const root = require('react-dom/client').createRoot(document.querySelector('main'));
  const Hub = require('../src/components/knowledge/KnowledgeHub.tsx').default;
  const Reader = require('../src/components/knowledge/TopicReader.tsx').default;
  const { renderToStaticMarkup } = require('react-dom/server');
  t.after(async () => {
    await React.act(async () => root.unmount());
    dom.window.close();
    Module._load = originalLoad;
  });
  const go = hash => React.act(async () => {
    window.history.pushState(null, '', hash);
    window.dispatchEvent(new window.HashChangeEvent('hashchange'));
  });
  const click = element => React.act(async () => element.click());
  const findButton = text => Array.from(document.querySelectorAll('button')).find(el => el.textContent.includes(text));
  const audit = async () => {
    const axe = require('axe-core');
    window.eval(axe.source);
    const result = await window.axe.run(document, { rules: { 'color-contrast': { enabled: false } } });
    assert.deepEqual(Array.from(result.violations, v => v.id), []);
  };
  await React.act(async () => root.render(React.createElement(Hub)));
  assert.match(document.querySelector('h1').textContent, /Beyond the Numbers/);
  await audit();
  for (const topic of topics) {
    const markup = renderToStaticMarkup(React.createElement(Reader, { topic }));
    assert.ok(markup.includes('Trusted references'), topic.id);
    assert.equal(markup.includes('Hypothetical scenario'), Boolean(topic.lesson), topic.id);
  }
  await go(HUB + '/category/insulin');
  assert.ok(document.querySelector('a[href="' + topicHref('carbohydrate-counting') + '"]'));
  await go(topicHref('insulin-to-carbohydrate-ratio-icr'));
  assert.equal(document.activeElement.tagName, 'H1');
  assert.equal(document.querySelectorAll('article details').length, 4);
  assert.equal(document.querySelector('input[type=number]'), null);
  await click(findButton('Show next step'));
  await click(findButton('Show next step'));
  assert.match(document.body.textContent, /two units in this example/);
  await click(findButton('Ten grams per unit'));
  assert.match(document.querySelector('[role=status]').textContent, /Yes/);
  await go(topicHref('diabetic-ketoacidosis-dka'));
  assert.match(document.body.textContent, /awaiting clinical review/);
  assert.equal(document.querySelector('article details'), null);
  assert.ok(document.querySelector('article a[href^="https://"]'));
  await go(topicHref('carbohydrate-counting'));
  assert.equal(document.querySelectorAll('article select').length, 2);
  assert.match(document.body.textContent, /Estimated meal carbohydrate/);
  await go(topicHref('dawn-phenomenon'));
  assert.equal(document.querySelector('input[type=range]').max, '23');
  await go(HUB);
  assert.equal(document.querySelectorAll('select').length, 1);
  const input = document.querySelector('input[type=search]');
  const type = value => React.act(async () => {
    Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set.call(input, value);
    input.dispatchEvent(new window.Event('input', { bubbles: true }));
  });
  await type('power cut');
  const guide = practicalGuides.find(item => item.id === 'guide-insulin-storage-climate');
  assert.ok(document.querySelector('a[href="' + guideHref(guide.id) + '"]'));
  await go(HUB + '/category/injection');
  assert.equal(document.querySelector('input[type=search]').value, 'power cut');
  await go(guideHref(guide.id));
  assert.equal(document.querySelector('h1').textContent, guide.title);
  for (const section of guide.guide.bodySections) assert.ok(document.body.textContent.includes(section.content));
  await go(HUB + '/topics');
  const reset = document.querySelector('a[href="' + HUB + '/topics"]');
  await click(reset);
  assert.equal(document.querySelector('input[type=search]').value, '');
  assert.match(document.querySelector('[role=status]').textContent, /140 topics/);
  assert.equal(document.querySelectorAll('input[type=checkbox]').length, 0);
});

test('global preferences survive the legacy guide redirect, navigation and a fresh mount', async t => {
  const dom = new JSDOM('<main id="root"></main>', { url: 'https://gluconest.test/#learn-community' });
  global.window = dom.window;
  Object.defineProperty(global, 'navigator', { configurable: true, value: dom.window.navigator });
  global.document = window.document;
  global.IS_REACT_ACT_ENVIRONMENT = true;
  window.matchMedia = () => ({ matches: false });
  window.scrollTo = () => {};
  window.localStorage.setItem('gluconest_language', 'hi');
  window.localStorage.setItem('gluconest_unit', 'mg/dL');
  const { AppProvider, useApp } = require('../src/context/AppContext.tsx');
  const root = require('react-dom/client').createRoot(document.querySelector('main'));
  let state;
  function Observer() { state = useApp(); return null; }
  const mount = key => React.act(async () => root.render(React.createElement(AppProvider, { key }, React.createElement(Observer))));
  t.after(async () => { await React.act(async () => root.unmount()); dom.window.close(); });
  await mount('initial');
  assert.equal(window.location.hash, HUB);
  assert.equal(state.activeSection, 'knowledge-hub');
  assert.equal(state.language, 'hi');
  assert.equal(state.glucoseUnit, 'mg/dL');
  await React.act(async () => { state.setLanguage('te'); state.toggleGlucoseUnit(); state.toggleDarkMode(); state.setActiveSection('my-day'); });
  assert.equal(document.documentElement.lang, 'te');
  assert.equal(document.documentElement.classList.contains('dark'), true);
  await mount('reload');
  assert.equal(state.activeSection, 'my-day');
  assert.equal(state.language, 'te');
  assert.equal(state.glucoseUnit, 'mmol/L');
  assert.equal(state.darkMode, true);
  await React.act(async () => state.setActiveSection('home'));
  assert.equal(state.language, 'te');
});
