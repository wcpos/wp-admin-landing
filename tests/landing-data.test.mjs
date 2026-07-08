import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../src/shared/landing-data.ts', import.meta.url), 'utf8');

test('WCPOSLanding contract carries optional bootstrap_flags (plugin ≥1.9.7)', () => {
  assert.match(source, /bootstrap_flags\?\s*:\s*Record<string,\s*string\s*\|\s*boolean>/);
});

test('getLandingData validates and includes bootstrap_flags', () => {
  assert.match(source, /isFlagMap\(raw\.bootstrap_flags\)/);
  assert.match(source, /validated\.bootstrap_flags\s*=\s*raw\.bootstrap_flags/);
});

test('flag-map guard rejects arrays and non-string|boolean values', () => {
  assert.match(source, /function isFlagMap/);
  // Arrays must be rejected (they are objects too).
  assert.match(source, /Array\.isArray\(value\)/);
  // Every value must be a string or boolean.
  assert.match(source, /typeof v === 'string' \|\| typeof v === 'boolean'/);
});
