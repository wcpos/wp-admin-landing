import test from 'node:test';
import assert from 'node:assert/strict';
import { findViolations } from '../scripts/lint-copy.mjs';

test('banned words and emoji are flagged', () => {
  const v = findViolations({ a: 'Simply install it', b: 'Hurry, limited time!', c: 'Great 🚀' });
  assert.equal(v.length, 3);
});

test('literal year counts flagged, placeholders pass', () => {
  assert.equal(findViolations({ a: 'twelve years of releases' }).length, 1);
  assert.equal(findViolations({ a: '12 years of releases' }).length, 1);
  assert.equal(findViolations({ a: '{releaseYears} years of releases' }).length, 0);
});

test('clean strings pass', () => {
  assert.equal(findViolations({ a: 'Pro keeps working. Updates and support stop.' }).length, 0);
});

test('allowlisted key skips only the just-rule', () => {
  assert.equal(findViolations({ ps: 'you just stop getting updates' }).length, 0);
  assert.equal(findViolations({ other: 'you just stop getting updates' }).length, 1);
  assert.equal(findViolations({ ps: 'Simply great' }).length, 1, 'other banned rules still apply to allowlisted keys');
});
