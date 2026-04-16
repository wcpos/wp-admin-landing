import test from 'node:test';
import assert from 'node:assert/strict';

import { verifyJsDelivrAlias } from '../../scripts/verify-jsdelivr-alias.mjs';

function makeFetch(bodiesByUrl) {
  return async (url) => {
    const entry = bodiesByUrl[url];
    if (!entry) {
      return { ok: false, status: 404, text: async () => '' };
    }
    return { ok: true, status: 200, text: async () => entry };
  };
}

test('resolves when alias bodies match exact-version bodies', async () => {
  const base = 'https://cdn.jsdelivr.net/npm/@wcpos/wp-admin-landing';
  const jsBody = 'console.log("welcome v2.0.3");';
  const cssBody = '.welcome{color:red}';
  const fetchImpl = makeFetch({
    [`${base}@2.0.3/assets/js/welcome.js`]: jsBody,
    [`${base}@2.0.3/assets/css/welcome.css`]: cssBody,
    [`${base}@2/assets/js/welcome.js`]: jsBody,
    [`${base}@2/assets/css/welcome.css`]: cssBody,
  });

  await assert.doesNotReject(() => verifyJsDelivrAlias({ fetchImpl, version: '2.0.3' }));
});

test('rejects when the alias still serves a stale JS bundle', async () => {
  const base = 'https://cdn.jsdelivr.net/npm/@wcpos/wp-admin-landing';
  const fetchImpl = makeFetch({
    [`${base}@2.0.3/assets/js/welcome.js`]: 'new',
    [`${base}@2.0.3/assets/css/welcome.css`]: 'same',
    [`${base}@2/assets/js/welcome.js`]: 'old',
    [`${base}@2/assets/css/welcome.css`]: 'same',
  });

  await assert.rejects(
    () => verifyJsDelivrAlias({ fetchImpl, version: '2.0.3' }),
    /alias JS does not match/i,
  );
});

test('rejects when any URL returns a non-ok status', async () => {
  const fetchImpl = async () => ({ ok: false, status: 404, text: async () => '' });
  await assert.rejects(
    () => verifyJsDelivrAlias({ fetchImpl, version: '2.0.3' }),
    /jsDelivr verification failed/i,
  );
});
