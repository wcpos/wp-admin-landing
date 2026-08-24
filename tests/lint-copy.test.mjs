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

test('the prohibited product name is flagged, the platform name is not', () => {
  // Copyright-driven naming convention: the product is WCPOS / WCPOS Pro.
  assert.equal(findViolations({ a: 'stores run WooCommerce POS on WordPress.org' }).length, 1);
  assert.equal(findViolations({ a: 'End-of-day report in WooCommerce POS Pro' }).length, 1);
  assert.equal(findViolations({ a: 'try woocommerce pos today' }).length, 1, 'case-insensitive');
  assert.equal(findViolations({ a: 'stores run WCPOS on WordPress.org' }).length, 0);
  assert.equal(findViolations({ a: 'End-of-day report in WCPOS Pro' }).length, 0);
  // "WooCommerce" on its own is the platform and must stay untouched.
  assert.equal(findViolations({ a: 'Use any WooCommerce gateway' }).length, 0);
  assert.equal(findViolations({ a: 'expert assistance with your WooCommerce store' }).length, 0);
});
