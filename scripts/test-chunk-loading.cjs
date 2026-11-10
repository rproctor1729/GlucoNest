const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const ts = require('typescript');
const { pathToFileURL } = require('node:url');
const path = require('node:path');

const source = fs.readFileSync('src/lib/chunkErrors.ts', 'utf8');
const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const loaded = { exports: {} };
new Function('exports', 'module', code)(loaded.exports, loaded);
const { isChunkLoadError } = loaded.exports;

test('identifies missing JavaScript chunks without misclassifying ordinary app errors', () => {
  const named = new Error('missing file');
  named.name = 'ChunkLoadError';
  assert.equal(isChunkLoadError(named), true);
  assert.equal(isChunkLoadError(new Error('Loading chunk feedback failed.')), true);
  assert.equal(isChunkLoadError(new Error('Failed to fetch dynamically imported module: /app.js')), true);
  assert.equal(isChunkLoadError(new Error('Invalid meal record')), false);
  assert.equal(isChunkLoadError(null), false);
});

test('normal development, preview, and production never share a build directory', async () => {
  const priorMode = process.env.NODE_ENV;
  const priorPreview = process.env.GLUCONEST_PREVIEW;
  const configUrl = pathToFileURL(path.resolve('next.config.mjs')).href;
  try {
    process.env.NODE_ENV = 'development';
    delete process.env.GLUCONEST_PREVIEW;
    const normal = (await import(`${configUrl}?mode=development`)).default.distDir;
    process.env.GLUCONEST_PREVIEW = '1';
    const preview = (await import(`${configUrl}?mode=preview`)).default.distDir;
    process.env.NODE_ENV = 'production';
    const production = (await import(`${configUrl}?mode=production`)).default.distDir;
    assert.equal(normal, '.next-dev');
    assert.equal(preview, '.next-preview');
    assert.equal(production, '.next');
    assert.equal(new Set([normal, preview, production]).size, 3);
  } finally {
    if (priorMode === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = priorMode;
    if (priorPreview === undefined) delete process.env.GLUCONEST_PREVIEW;
    else process.env.GLUCONEST_PREVIEW = priorPreview;
  }
});
