import test from 'node:test';
import assert from 'node:assert/strict';
import { decideVariant, resolveAssets, CACHE_TTL_MS } from '../src/bootstrap/variant-decision.mjs';

const VALID = ['indie', 'free-plus'];
const base = {
  flagValue: undefined,
  cached: null,
  anonId: 'a-1',
  schemaVersion: 2,
  now: 1_000_000,
  validVariants: VALID,
  killSwitch: false,
  proActive: false,
  fallbackVariant: 'free-plus',
};

test('flag value wins and is cached', () => {
  const d = decideVariant({ ...base, flagValue: 'indie' });
  assert.deepEqual(d, { variant: 'indie', renderSource: 'flag', cache: true });
});

test('invalid flag value falls through to fallback', () => {
  const d = decideVariant({ ...base, flagValue: 'personalised' });
  assert.equal(d.renderSource, 'fallback');
  assert.equal(d.variant, 'free-plus');
  assert.equal(d.cache, false, 'fallback renders are never cached (spec §8)');
});

test('valid cache used when flag absent', () => {
  const cached = { variant: 'indie', anonId: 'a-1', schemaVersion: 2, ts: 999_000 };
  const d = decideVariant({ ...base, cached });
  assert.deepEqual(d, { variant: 'indie', renderSource: 'cache', cache: false });
});

test('cache rejected on anon_id rotation, schema bump, or TTL expiry', () => {
  const cached = { variant: 'indie', anonId: 'a-1', schemaVersion: 2, ts: 999_000 };
  assert.equal(decideVariant({ ...base, cached: { ...cached, anonId: 'a-2' } }).renderSource, 'fallback');
  assert.equal(decideVariant({ ...base, cached: { ...cached, schemaVersion: 1 } }).renderSource, 'fallback');
  assert.equal(decideVariant({ ...base, cached, now: 999_000 + CACHE_TTL_MS + 1 }).renderSource, 'fallback');
});

test('kill switch forces fallback even with flag and cache', () => {
  const cached = { variant: 'indie', anonId: 'a-1', schemaVersion: 2, ts: 999_000 };
  const d = decideVariant({ ...base, flagValue: 'indie', cached, killSwitch: true });
  assert.deepEqual(d, { variant: 'free-plus', renderSource: 'fallback', cache: false });
});

test('pro_active renders fallback variant without caching (§3.1.6)', () => {
  const d = decideVariant({ ...base, flagValue: 'indie', proActive: true });
  assert.deepEqual(d, { variant: 'free-plus', renderSource: 'fallback', cache: false });
});

test('resolveAssets: payload override accepted at or above ASSET_VERSION', () => {
  const map = { indie: { js: 'cdn/i.js', css: 'cdn/i.css' } };
  const ok = resolveAssets('indie', { asset_version: 1, variants: { indie: { js: 'x.js', css: 'x.css' } } }, map, 1);
  assert.deepEqual(ok, { js: 'x.js', css: 'x.css' });
});

test('resolveAssets: stale or malformed payload rejected → hardcoded map', () => {
  const map = { indie: { js: 'cdn/i.js', css: 'cdn/i.css' } };
  for (const payload of [null, 42, { asset_version: 0, variants: { indie: { js: 'x', css: 'y' } } }, { asset_version: 1 }]) {
    assert.deepEqual(resolveAssets('indie', payload, map, 1), { js: 'cdn/i.js', css: 'cdn/i.css' });
  }
});
