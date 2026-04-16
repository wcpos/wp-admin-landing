import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const EXPECTED_FILES = new Set([
  'assets/js/welcome.js',
  'assets/css/welcome.css',
  'package.json',
]);

async function walkFiles(rootDir, currentDir = rootDir, files = []) {
  const entries = await fs.readdir(currentDir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(currentDir, entry.name);
    if (entry.isDirectory()) {
      await walkFiles(rootDir, fullPath, files);
    } else {
      files.push(path.relative(rootDir, fullPath).split(path.sep).join('/'));
    }
  }
  return files;
}

export async function verifyReleasePackage(packageDir) {
  const files = new Set(await walkFiles(packageDir));

  for (const expectedFile of EXPECTED_FILES) {
    if (!files.has(expectedFile)) {
      throw new Error(`Missing expected file: ${expectedFile}`);
    }
  }

  for (const file of files) {
    if (!EXPECTED_FILES.has(file)) {
      throw new Error(`Unexpected file found in staged package: ${file}`);
    }
  }

  const pkg = JSON.parse(await fs.readFile(path.join(packageDir, 'package.json'), 'utf8'));
  if (pkg.name !== '@wcpos/wp-admin-landing') {
    throw new Error(`Unexpected package name: ${pkg.name}`);
  }
  if (!pkg.version) {
    throw new Error('Staged package.json is missing version');
  }
  if (!Array.isArray(pkg.files) || pkg.files.length !== 1 || pkg.files[0] !== 'assets') {
    throw new Error('Staged package.json must include files: ["assets"]');
  }
  if (pkg.publishConfig?.access !== 'public') {
    throw new Error('Staged package.json must set publishConfig.access to "public"');
  }

  return Array.from(files).sort();
}

function isCliEntry() {
  const entryPath = process.argv[1];
  return entryPath && fileURLToPath(import.meta.url) === path.resolve(entryPath);
}

if (isCliEntry()) {
  const packageDir = process.argv[2];
  verifyReleasePackage(packageDir).catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
