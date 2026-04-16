import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { verifyReleasePackage } from '../../scripts/verify-release-package.mjs';

test('accepts a package containing only expected welcome files', async () => {
  const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'verify-release-package-'));
  await fs.mkdir(path.join(tmp, 'assets/js'), { recursive: true });
  await fs.mkdir(path.join(tmp, 'assets/css'), { recursive: true });
  await fs.writeFile(path.join(tmp, 'assets/js/welcome.js'), 'ok');
  await fs.writeFile(path.join(tmp, 'assets/css/welcome.css'), 'ok');
  await fs.writeFile(path.join(tmp, 'package.json'), JSON.stringify({ name: '@wcpos/wp-admin-landing', version: '2.0.3' }));

  await assert.doesNotReject(() => verifyReleasePackage(tmp));
});

test('rejects a package with extra files', async () => {
  const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'verify-release-package-extra-'));
  await fs.mkdir(path.join(tmp, 'assets/js'), { recursive: true });
  await fs.mkdir(path.join(tmp, 'assets/css'), { recursive: true });
  await fs.writeFile(path.join(tmp, 'assets/js/welcome.js'), 'ok');
  await fs.writeFile(path.join(tmp, 'assets/css/welcome.css'), 'ok');
  await fs.writeFile(path.join(tmp, 'package.json'), JSON.stringify({ name: '@wcpos/wp-admin-landing', version: '2.0.3' }));
  await fs.writeFile(path.join(tmp, 'assets/js/landing.js'), 'legacy');

  await assert.rejects(() => verifyReleasePackage(tmp), /unexpected file/i);
});
