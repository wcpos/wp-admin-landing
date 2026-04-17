import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../src/lib/analytics.ts', import.meta.url), 'utf8');
const bundle = readFileSync(new URL('../assets/js/welcome.js', import.meta.url), 'utf8');

test('PostHog init disables session recording on the landing page', () => {
  assert.match(
    source,
    /disable_session_recording\s*:\s*true/,
    'Expected posthog.init(...) to set disable_session_recording: true'
  );
});

test('Published bundle preserves disable_session_recording', () => {
  assert.match(
    bundle,
    /disable_session_recording\s*:\s*(?:true|!0)/,
    'Expected assets/js/welcome.js to preserve disable_session_recording'
  );
});
