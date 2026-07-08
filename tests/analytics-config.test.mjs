import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../src/shared/analytics.ts', import.meta.url), 'utf8');
const landingDataSource = readFileSync(new URL('../src/shared/landing-data.ts', import.meta.url), 'utf8');

test('PostHog persistence is localStorage (identity fix, spec §5.1)', () => {
  assert.match(source, /persistence\s*:\s*'localStorage'/);
  assert.doesNotMatch(source, /persistence\s*:\s*'memory'/);
});

test('person profiles always + session recording stays off', () => {
  assert.match(source, /person_profiles\s*:\s*'always'/);
  assert.match(source, /disable_session_recording\s*:\s*true/);
});

test('before_send strips admin URLs', () => {
  assert.match(source, /key\.startsWith\('\$session_entry_'\)/, 'before_send must strip the $session_entry_* URL family');
  for (const key of ['\\$current_url', '\\$host', '\\$pathname', '\\$referrer', '\\$referring_domain']) {
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

test('wp-admin landing analytics keeps safe domain props while stripping full URLs', () => {
  assert.match(source, /function getReferringDomain\(\)/, 'referrer collection should be centralized in a domain-only helper');
  assert.match(source, /new URL\(document\.referrer\)\.hostname/, 'referrer helper must only read the hostname');
  assert.match(source, /referring_domain/, 'custom referring_domain should be sent for dashboard breakdowns');
  assert.match(source, /posthog\.unregister\(key\)/, 'volatile domain super properties must be cleared before registering current-load values');
  assert.match(source, /\?\.site_domain \? \{ site_domain: data\.profile\.site_domain \}/, 'consented site domain should be registered as a super property when present');
  assert.match(source, /\?\.admin_domain \? \{ admin_domain: data\.profile\.admin_domain \}/, 'consented admin domain should be registered as a super property when present');
  assert.doesNotMatch(source, /referring_domain:\s*document\.referrer/, 'full document.referrer must not be sent directly');
});

test('consented profile contract accepts optional domain-only hosts from the plugin', () => {
  assert.match(landingDataSource, /site_domain\?:\s*string/);
  assert.match(landingDataSource, /admin_domain\?:\s*string/);
  assert.match(landingDataSource, /typeof p\.site_domain === 'undefined' \|\| typeof p\.site_domain === 'string'/);
  assert.match(landingDataSource, /typeof p\.admin_domain === 'undefined' \|\| typeof p\.admin_domain === 'string'/);
});
