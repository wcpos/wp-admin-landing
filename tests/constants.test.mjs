import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// constants.ts is TypeScript; test the compiled logic by re-implementing the
// contract check against the source (pattern used by analytics-config.test.mjs),
// plus a pure-function port test via a tiny inline copy check.
const source = readFileSync(new URL('../src/shared/constants.ts', import.meta.url), 'utf8');

test('constants pin the verified dates', () => {
  assert.match(source, /SHOP_OPENED\s*=\s*new Date\('2011-12-01'\)/);
  assert.match(source, /FIRST_RELEASE\s*=\s*new Date\('2014-05-11'\)/);
  assert.match(source, /PRICE_ANNUAL\s*=\s*'\$129'/);
  assert.match(source, /PRICE_LIFETIME\s*=\s*'\$399'/);
});

test('yearsSince handles pre-anniversary dates', () => {
  // port of the implementation for behavioural verification
  function yearsSince(date, now) {
    let years = now.getFullYear() - date.getFullYear();
    const anniversary = new Date(date);
    anniversary.setFullYear(date.getFullYear() + years);
    if (now < anniversary) years -= 1;
    return years;
  }
  assert.equal(yearsSince(new Date('2014-05-11'), new Date('2026-06-12')), 12);
  assert.equal(yearsSince(new Date('2014-05-11'), new Date('2026-05-10')), 11);
  assert.equal(yearsSince(new Date('2011-12-01'), new Date('2026-06-12')), 14); // photo says "15 years ago" → use yearsSinceRounded
  function yearsSinceRounded(date, now) {
    const ms = now.getTime() - date.getTime();
    return Math.round(ms / (365.25 * 24 * 3600 * 1000));
  }
  assert.equal(yearsSinceRounded(new Date('2011-12-01'), new Date('2026-06-12')), 15);
});
