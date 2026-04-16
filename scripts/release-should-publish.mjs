import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RELEASE_PATH_PATTERNS = [
  /^src\//,
  /^vite\.config\.ts$/,
  /^package\.json$/,
  /^package-lock\.json$/,
  /^tsconfig\.json$/,
  /^scripts\/(next-release-tag|release-should-publish|stage-release-package|verify-release-package|verify-jsdelivr-alias)\.mjs$/,
];

export function normalizePaths(paths) {
  return paths
    .map((file) => file.trim())
    .filter(Boolean)
    .map((file) => file.split(path.sep).join('/'));
}

export function shouldPublishRelease(paths) {
  return normalizePaths(paths).some((file) => RELEASE_PATH_PATTERNS.some((pattern) => pattern.test(file)));
}

function isCliEntry() {
  const entryPath = process.argv[1];
  return entryPath && fileURLToPath(import.meta.url) === path.resolve(entryPath);
}

if (isCliEntry()) {
  const changedFiles = process.argv.slice(2);
  const release = shouldPublishRelease(changedFiles);
  process.stdout.write(`release=${release}\n`);
}
