const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const test = require('node:test');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');

const resolve = Module._resolveFilename;
Module._resolveFilename = function (request, ...args) {
  return resolve.call(this, request.startsWith('@/') ? path.resolve('src', request.slice(2)) : request, ...args);
};
for (const extension of ['.ts', '.tsx', '.jsx']) {
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
const { AppProvider } = require(path.resolve('src/context/AppContext.tsx'));

test('React Bits integration server-renders all photographs with only the first slide exposed', async () => {
  // Use the package's ESM export; its current CJS entry is marked as ESM under Node 26.
  const icons = await import('lucide-react');
  const originalLoad = Module._load;
  Module._load = function (request, ...args) {
    return request === 'lucide-react' ? icons : originalLoad.call(this, request, ...args);
  };
  const HeroCarousel = require(path.resolve('src/components/home/HeroCarousel.tsx')).default;
  const render = () => renderToStaticMarkup(React.createElement(AppProvider, null, React.createElement(HeroCarousel)));
  const first = render();
  assert.equal(render(), first);
  assert.match(first, /aria-roledescription="carousel"/);
  assert.equal((first.match(/aria-roledescription="slide"/g) || []).length, 3);
  assert.equal((first.match(/aria-hidden="true" inert=""/g) || []).length, 2);
  assert.match(first, /Play slideshow/);
  assert.match(first, /Previous slide/);
  assert.match(first, /Next slide/);
  assert.match(first, /insulin\.jpg/);
  assert.match(first, /checking\.jpg/);
  assert.match(first, /meter\.jpg/);
  assert.match(first, /Illustrative reading/);
  assert.match(first, /var\(--hero-carousel-ratio\)/);
});
