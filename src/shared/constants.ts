/** Verified public facts — single source of truth for all copy (spec §1). */
export const SHOP_OPENED = new Date('2011-12-01');
export const FIRST_RELEASE = new Date('2014-05-11');
export const PRICE_ANNUAL = '$129';
export const PRICE_LIFETIME = '$399';
export const INSTALL_COUNT = '6,000+';
export const DEMO_URL = 'https://demo.wcpos.com/pos';
export const ROADMAP_URL = 'https://github.com/orgs/wcpos/projects/4/views/1';
export const REVIEW_URL = 'https://wordpress.org/support/plugin/woocommerce-pos/reviews/#new-post';
export const PRO_URL = 'https://wcpos.com/pro';

export const CDN_BASE = 'https://cdn.jsdelivr.net/gh/wcpos/wp-admin-landing@v2/assets';
/** Bumped when the event/data contract changes; fences pre-fix data (§5.1). */
export const ANALYTICS_SCHEMA_VERSION = 2;
/** Compiled-in minimum; flag payloads below this are rejected (§3.1.5). */
export const ASSET_VERSION = 1;

/** Whole years elapsed, anniversary-aware. Dates are UTC-midnight constants compared against caller-local `now`; copy-level precision only — may flip a day early/late around the anniversary in non-UTC timezones, which is acceptable for marketing copy. */
export function yearsSince(date: Date, now: Date = new Date()): number {
  let years = now.getFullYear() - date.getFullYear();
  const anniversary = new Date(date);
  anniversary.setFullYear(date.getFullYear() + years);
  if (now < anniversary) years -= 1;
  return years;
}

/** Nearest whole years via Julian-year (365.25d) approximation — the letter's "15 years ago" photo line (14.5 → 15). Copy-level precision only. */
export function yearsSinceRounded(date: Date, now: Date = new Date()): number {
  const ms = now.getTime() - date.getTime();
  return Math.round(ms / (365.25 * 24 * 3600 * 1000));
}
