import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { stageReleasePackage } from '../../scripts/stage-release-package.mjs';

test('stages only welcome assets and package metadata for npm publishing', async () => {
  const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'stage-release-package-'));
  const buildDir = path.join(tmp, 'build');
  const outputDir = path.join(tmp, 'out');

  await fs.mkdir(path.join(buildDir, 'assets/js'), { recursive: true });
  await fs.mkdir(path.join(buildDir, 'assets/css'), { recursive: true });
  await fs.writeFile(path.join(buildDir, 'assets/js/welcome.js'), 'console.log("hi")');
  await fs.writeFile(path.join(buildDir, 'assets/css/welcome.css'), 'body{}');
  await fs.writeFile(path.join(buildDir, 'assets/js/landing.js'), 'legacy');

  await stageReleasePackage({
    buildDir,
    outputDir,
    version: '2.0.3',
    packageName: '@wcpos/wp-admin-landing',
  });

  const files = [];
  const walk = async (dir, prefix = '') => {
    for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
      const relative = path.posix.join(prefix, entry.name);
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(full, relative);
      } else {
        files.push(relative);
      }
    }
  };

  await walk(outputDir);
  files.sort();

  assert.deepEqual(files, [
    'assets/css/welcome.css',
    'assets/js/welcome.js',
    'package.json',
  ]);

  const pkg = JSON.parse(await fs.readFile(path.join(outputDir, 'package.json'), 'utf8'));
  assert.equal(pkg.name, '@wcpos/wp-admin-landing');
  assert.equal(pkg.version, '2.0.3');
  assert.equal(pkg.files.length, 1);
  assert.equal(pkg.files[0], 'assets');
});


test('staging accepts the assets directory as the build root', async () => {
  const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'stage-release-package-assets-root-'));
  const buildDir = path.join(tmp, 'assets');
  const outputDir = path.join(tmp, 'out');

  await fs.mkdir(path.join(buildDir, 'js'), { recursive: true });
  await fs.mkdir(path.join(buildDir, 'css'), { recursive: true });
  await fs.writeFile(path.join(buildDir, 'js/welcome.js'), 'console.log("hi")');
  await fs.writeFile(path.join(buildDir, 'css/welcome.css'), 'body{}');

  await stageReleasePackage({
    buildDir,
    outputDir,
    version: '2.0.3',
    packageName: '@wcpos/wp-admin-landing',
  });

  await assert.doesNotReject(() => fs.access(path.join(outputDir, 'assets/js/welcome.js')));
  await assert.doesNotReject(() => fs.access(path.join(outputDir, 'assets/css/welcome.css')));
});
