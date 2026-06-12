import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../src/shared/analytics.ts', import.meta.url), 'utf8');

test('PostHog persistence is localStorage (identity fix, spec §5.1)', () => {
  assert.match(source, /persistence\s*:\s*'localStorage'/);
  assert.doesNotMatch(source, /persistence\s*:\s*'memory'/);
});

test('person profiles always + session recording stays off', () => {
  assert.match(source, /person_profiles\s*:\s*'always'/);
  assert.match(source, /disable_session_recording\s*:\s*true/);
});

test('before_send strips admin URLs', () => {
  for (const key of ['\\$current_url', '\\$host', '\\$pathname', '\\$referrer']) {
    assert.match(source, new RegExp(key), `before_send must strip ${key}`);
  }
});

test('bootstrap distinctID only when nothing persisted (no per-load re-keying)', () => {
  assert.match(source, /hasPersistedIdentity/);
  assert.match(source, /isIdentifiedID\s*:\s*false/);
});

test('Google Analytics is gone (spec §5.1: removed entirely)', () => {
  assert.doesNotMatch(source, /react-ga4|ReactGA|G-08SJ28P1E5/);
});

test('flag-before-identify: identify lives in identifyConsented, not init', () => {
  assert.match(source, /export function identifyConsented/);
  const initBody = source.slice(source.indexOf('export function initAnalytics'), source.indexOf('export function identifyConsented'));
  assert.doesNotMatch(initBody, /posthog\.identify\(/, 'initAnalytics must not call identify()');
});

test('visit counter is session-guarded (once per session, spec §5.1)', () => {
  assert.match(source, /sessionStorage/);
  assert.match(source, /VISIT_SESSION_KEY/);
});
