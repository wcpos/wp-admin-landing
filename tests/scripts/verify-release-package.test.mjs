import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { verifyReleasePackage } from '../../scripts/verify-release-package.mjs';

const VALID_PACKAGE_JSON = {
  name: '@wcpos/wp-admin-landing',
  version: '2.0.3',
  files: ['assets'],
  publishConfig: { access: 'public' },
};

async function buildValidPackage(prefix, overrides = {}) {
  const tmp = await fs.mkdtemp(path.join(os.tmpdir(), `${prefix}-`));
  await fs.mkdir(path.join(tmp, 'assets/js'), { recursive: true });
  await fs.mkdir(path.join(tmp, 'assets/css'), { recursive: true });
  await fs.writeFile(path.join(tmp, 'assets/js/welcome.js'), 'ok');
  await fs.writeFile(path.join(tmp, 'assets/css/welcome.css'), 'ok');
  await fs.writeFile(
    path.join(tmp, 'package.json'),
    JSON.stringify({ ...VALID_PACKAGE_JSON, ...overrides }),
  );
  return tmp;
}

test('accepts a package containing only expected welcome files', async () => {
  const tmp = await buildValidPackage('verify-release-package');
  await assert.doesNotReject(() => verifyReleasePackage(tmp));
});

test('rejects a package with extra files', async () => {
  const tmp = await buildValidPackage('verify-release-package-extra');
  await fs.writeFile(path.join(tmp, 'assets/js/landing.js'), 'legacy');
  await assert.rejects(() => verifyReleasePackage(tmp), /unexpected file/i);
});

test('rejects a package missing a required asset', async () => {
  const tmp = await buildValidPackage('verify-release-package-missing');
  await fs.rm(path.join(tmp, 'assets/css/welcome.css'));
  await assert.rejects(() => verifyReleasePackage(tmp), /missing expected file/i);
});

test('rejects a package with the wrong package name', async () => {
  const tmp = await buildValidPackage('verify-release-package-name', { name: 'something-else' });
  await assert.rejects(() => verifyReleasePackage(tmp), /unexpected package name/i);
});

test('rejects a package.json missing a version', async () => {
  const tmp = await buildValidPackage('verify-release-package-noversion', { version: undefined });
  await assert.rejects(() => verifyReleasePackage(tmp), /missing version/i);
});

test('rejects a package.json without files: ["assets"]', async () => {
  const tmp = await buildValidPackage('verify-release-package-files', { files: ['src'] });
  await assert.rejects(() => verifyReleasePackage(tmp), /files:\s*\["assets"\]/i);
});

test('rejects a package.json without publishConfig.access = "public"', async () => {
  const tmp = await buildValidPackage('verify-release-package-access', { publishConfig: { access: 'restricted' } });
  await assert.rejects(() => verifyReleasePackage(tmp), /publishConfig\.access.*public/i);
});
