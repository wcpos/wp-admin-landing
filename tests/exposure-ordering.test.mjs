// tests/exposure-ordering.test.mjs
// Guards the flag-before-identify invariant on the instant-cache render path
// (spec §3.1.4 / §5.1). The cache path MUST read landing-variant synchronously
// (so $feature_flag_called lands in the anon_id bucket before the bootstrap's
// identify(site_uuid)) and MUST NOT use an async onFeatureFlags subscription
// there — an async read could fire post-identify and record the wrong bucket,
// breaking the SRM/stickiness canary.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const loader = readFileSync(new URL('../src/bootstrap/variant-loader.ts', import.meta.url), 'utf8');
const bootstrap = readFileSync(new URL('../src/bootstrap/index.tsx', import.meta.url), 'utf8');

/** Extract the body of a named function/arrow up to a heuristic close. */
function slice(source, from, to) {
  const a = source.indexOf(from);
  const b = source.indexOf(to, a + from.length);
  return a >= 0 && b > a ? source.slice(a, b) : '';
}

test('cache path records exposure synchronously, not via onFeatureFlags', () => {
  // The synchronous exposure helper exists and reads the flag.
  assert.match(loader, /function recordCachedExposure/);
  const helper = slice(loader, 'function recordCachedExposure', '\n}');
  assert.match(helper, /getFeatureFlag\(FLAG_KEY\)/, 'must read landing-variant (fires $feature_flag_called)');
  assert.doesNotMatch(helper, /onFeatureFlags/, 'exposure read must be synchronous — no subscription that could fire post-identify');
});

test('cache branch calls the synchronous helper before returning', () => {
  const cacheBranch = slice(loader, "fast.renderSource === 'cache'", 'return {');
  assert.match(cacheBranch, /recordCachedExposure\(ph\)/);
  assert.doesNotMatch(cacheBranch, /onFeatureFlags|watchExposure/, 'cache path must not subscribe for exposure');
});

test('kill-switch read does not pollute exposure and clears cache for next load', () => {
  const helper = slice(loader, 'function recordCachedExposure', '\n}');
  assert.match(helper, /KILL_SWITCH_KEY,\s*\{\s*send_event:\s*false\s*\}/, 'kill-switch must not fire $feature_flag_called');
  assert.match(helper, /clearCache\(\)/, 'kill-switch on a cached render clears the cache (takes effect next load)');
});

test('fresh kill-switch is watched without re-reading the experiment flag (no post-identify exposure)', () => {
  // The async kill-switch watch picks up a switch flipped after the last load,
  // but must NOT read the experiment flag (FLAG_KEY) — that would record
  // $feature_flag_called post-identify in the wrong bucket.
  assert.match(loader, /function watchKillSwitch/);
  const watch = slice(loader, 'function watchKillSwitch', '\n}');
  assert.match(watch, /KILL_SWITCH_KEY,\s*\{\s*send_event:\s*false\s*\}/, 'kill-switch watch is non-exposure');
  assert.doesNotMatch(watch, /getFeatureFlag\(FLAG_KEY\)/, 'kill-switch watch must not read the experiment flag');
  assert.match(watch, /clearCache\(\)/);
  // Must NOT unsubscribe after the first (inline/stale) callback — that would
  // miss the fresh network reload. It stays subscribed (bounded by a timeout)
  // and clears only on an observed ON value.
  assert.doesNotMatch(watch, /if \(fired\)\s*unsub/, 'must not unsubscribe after the first stale callback');
  assert.match(watch, /setTimeout\(/, 'subscription is bounded by a timeout, not closed on first fire');
  const cacheBranch = slice(loader, "fast.renderSource === 'cache'", 'return {');
  assert.match(cacheBranch, /watchKillSwitch\(ph\)/, 'cache path arms the fresh kill-switch watch');
});

test('preview disables production flag resolution', () => {
  const analytics = readFileSync(new URL('../src/shared/analytics.ts', import.meta.url), 'utf8');
  assert.match(analytics, /advanced_disable_flags:\s*preview/, 'preview must not resolve production feature flags');
});

test('bootstrap reads the flag (prepareVariant) before identifyConsented', () => {
  // Ordering: prepareVariant (which does the synchronous exposure read on the
  // cache path, and awaits resolveFlag on the cold path) resolves before identify.
  const prepareIdx = bootstrap.indexOf('await prepareVariant');
  const identifyIdx = bootstrap.indexOf('identifyConsented()');
  assert.ok(prepareIdx >= 0 && identifyIdx >= 0, 'both calls present');
  assert.ok(prepareIdx < identifyIdx, 'prepareVariant (flag read) must precede identifyConsented()');
});
