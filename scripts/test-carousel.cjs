const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const ts = require('typescript');

const code = ts.transpileModule(fs.readFileSync('src/utils/carousel.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
const loaded = { exports: {} };
new Function('exports', 'require', 'module', code)(loaded.exports, require, loaded);
const { carouselIndex, canRotateCarousel, springFrame } = loaded.exports;

test('carousel wraps forwards and backwards without an invalid slide', () => {
  assert.equal(carouselIndex(3, 3), 0);
  assert.equal(carouselIndex(-1, 3), 2);
  assert.equal(carouselIndex(7, 3), 1);
  assert.equal(carouselIndex(2, 0), 0);
  assert.equal(carouselIndex(NaN, 3), 0);
});

test('React Bits spring settles accurately at 30, 60 and 120 frames per second', () => {
  for (const fps of [30, 60, 120]) {
    let position = 0, velocity = 0, settled = false;
    for (let frame = 0; frame < fps * 3; frame++) {
      const next = springFrame(position, velocity, 1, 1 / fps);
      position = next.position; velocity = next.velocity; settled = next.settled;
    }
    assert.equal(settled, true);
    assert.equal(position, 1);
    assert.equal(velocity, 0);
  }
});

test('reduced motion snaps to the selected slide without spring movement', () => {
  assert.deepEqual(springFrame(.4, 8, 2, 1 / 60, true), { position: 2, velocity: 0, settled: true });
});

test('autoplay waits for visible, loaded images and stops for pause or hover', () => {
  const ready = { requested: true, hovered: false, visible: true, inView: true, ready: true };
  assert.equal(canRotateCarousel(ready), true);
  for (const state of [
    { requested: false }, { hovered: true }, { visible: false }, { inView: false }, { ready: false },
  ]) assert.equal(canRotateCarousel({ ...ready, ...state }), false);
});
