import test from 'node:test';
import assert from 'node:assert/strict';

import { shouldPublishRelease } from '../../scripts/release-should-publish.mjs';

test('publishes when source files change', () => {
  assert.equal(shouldPublishRelease(['src/index.tsx']), true);
  assert.equal(shouldPublishRelease(['src/index.css']), true);
});

test('publishes when build inputs change', () => {
  assert.equal(shouldPublishRelease(['vite.config.ts']), true);
  assert.equal(shouldPublishRelease(['package.json']), true);
  assert.equal(shouldPublishRelease(['package-lock.json']), true);
  assert.equal(shouldPublishRelease(['tsconfig.json']), true);
});

test('does not publish for docs-only changes', () => {
  assert.equal(shouldPublishRelease(['README.md']), false);
  assert.equal(shouldPublishRelease(['docs/superpowers/specs/example.md']), false);
});

test('verify-jsdelivr helper builds npm URLs with scoped package paths', async () => {
  const { buildJsDelivrUrls } = await import('../../scripts/verify-jsdelivr-alias.mjs');
  const urls = buildJsDelivrUrls({ version: '2.0.3' });

  assert.equal(
    urls.aliasJs,
    'https://cdn.jsdelivr.net/npm/@wcpos/wp-admin-landing@2/assets/js/welcome.js',
  );
  assert.equal(
    urls.exactCss,
    'https://cdn.jsdelivr.net/npm/@wcpos/wp-admin-landing@2.0.3/assets/css/welcome.css',
  );
});
