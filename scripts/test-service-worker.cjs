const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const test = require('node:test');

function worker({ network, cached, keys = [] }) {
  const handlers = {};
  const writes = [];
  const deleted = [];
  vm.runInNewContext(fs.readFileSync('public/sw.js', 'utf8'), {
    URL, Response,
    self: { location: { origin: 'https://gluconest.test' }, addEventListener: (type, handler) => { handlers[type] = handler; }, clients: { claim: async () => {} } },
    fetch: network,
    caches: {
      match: async () => cached,
      keys: async () => keys,
      delete: async key => { deleted.push(key); },
      open: async () => ({ put: async (...args) => { writes.push(args); } }),
    },
  });
  return { handlers, writes, deleted };
}

async function fetchAsset(runtime, path = '/_next/static/chunks/app/page.js') {
  let response;
  const pending = [];
  runtime.handlers.fetch({
    request: { method: 'GET', url: `https://gluconest.test${path}`, mode: 'cors' },
    respondWith: promise => { response = promise; },
    waitUntil: promise => { pending.push(promise); },
  });
  const result = await response;
  await Promise.all(pending);
  return result;
}

test('current JavaScript wins over an old cached navbar bundle', async () => {
  const runtime = worker({ network: async () => new Response('current navbar'), cached: new Response('old navbar') });
  assert.equal(await (await fetchAsset(runtime)).text(), 'current navbar');
  assert.equal(runtime.writes.length, 1);
});

test('offline static assets fall back to the cached bundle', async () => {
  const runtime = worker({ network: async () => { throw new Error('offline'); }, cached: new Response('offline bundle') });
  assert.equal(await (await fetchAsset(runtime)).text(), 'offline bundle');
});

test('installed clients receive the current brand mark and manifest', async () => {
  for (const path of ['/icon.svg', '/manifest.json']) {
    const runtime = worker({ network: async () => new Response('new brand'), cached: new Response('old brand') });
    assert.equal(await (await fetchAsset(runtime, path)).text(), 'new brand');
  }
});

test('missing offline assets return a network error response', async () => {
  const runtime = worker({ network: async () => { throw new Error('offline'); } });
  assert.equal((await fetchAsset(runtime)).type, 'error');
});

test('activation only removes obsolete GlucoNest shell caches', async () => {
  const runtime = worker({ network: async () => new Response('ok'), keys: ['gluconest-shell-v1', 'gluconest-shell-v2', 'gluconest-shell-v3', 'unrelated-app'] });
  let pending;
  runtime.handlers.activate({ waitUntil: promise => { pending = promise; } });
  await pending;
  assert.deepEqual(runtime.deleted, ['gluconest-shell-v1', 'gluconest-shell-v2']);
});
