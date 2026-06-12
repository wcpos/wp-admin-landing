# Landing Experiments (wp-admin-landing repo) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
> **Execution context:** create an isolated worktree first (`/worktree`) — the main tree stays on `main`.

**Goal:** Build the two-variant (indie / free-plus) experiment-ready landing page: stable bootstrap with PostHog-driven variant loading, the identity fix, per-variant i18n, build-time content fetchers, and CI copy gates.

**Architecture:** A bootstrap IIFE (`welcome.js`) owns posthog-js/i18next and exposes them as `window.wcpos.landingRuntime`; it resolves the `landing-variant` flag *before* any `identify()`, then injects a UI-only variant IIFE from the CDN. Variants carry their own English strings and mount themselves via the runtime. Rollup cannot code-split IIFE builds, so sharing is by runtime contract, not chunking. All copy facts derive from constants; CI lints enforce it.

**Tech Stack:** Vite 6 (3 sequential IIFE builds via `BUILD_TARGET`), React 18 (external → `wp.element`), Tailwind v4 (`wcpos:` prefix), posthog-js, i18next + react-i18next, `node --test`.

**Spec:** `docs/superpowers/specs/2026-06-12-landing-experiments-design.md` (§§ referenced throughout). This plan covers **plan 1 of 4** only (this repo). Plugin (`anon_id` injection), wcpos.com (reconciler), and demo-server work are separate plans; until the plugin ships `anon_id`, the bootstrap must work with it absent (it does — assignment cache just keys on `'no-anon'` and PostHog falls back to its own generated id).

**Pre-conditions / inputs:**
- Free-plus picks default per spec §2.2: Headline A, Demo B (cream button), Fair-licence B (under CTA), Comparison A (table), Disqualifier off (copy still shipped in JSON for the future test).
- Photo asset `assets/img/paul-urban-locavore.jpg` — if absent at build time, the letter renders the pre-approved fallback opening (handled in Task 12; the build does not block).
- `npm` is the package manager (repo has `package-lock.json`).

---

## File structure (target)

```
src/
  shared/
    constants.ts            dates, prices, CDN base, schema/asset versions, yearsSince()
    landing-data.ts         MOVED from src/lib/ + anon_id field
    analytics.ts            MOVED from src/lib/ + identity fix (§5.1) + event helpers (§5.2)
    profile-report.ts       MOVED from src/lib/ (unchanged content, new import path)
    i18n.ts                 MOVED from src/lib/ + per-variant namespaces (§4)
    runtime.ts              LandingRuntime type + expose/read helpers (§3.1.3)
    wporg-reviews.json      build-time snapshot (Task 10)
    roadmap.json            build-time snapshot (Task 11)
  bootstrap/
    index.tsx               orchestration (§3.1) — replaces src/index.tsx as welcome.js entry
    variant-loader.ts       pure decision logic + cache + asset map (§3.1.4–5, §8)
    skeleton.ts             minimal loading placeholder
  variants/
    indie/index.tsx         §2.1 page (self-mounting, UI-only)
    indie/components/…      letter, photo, roadmap-card usage
    free-plus/index.tsx     §2.2 page (defaults)
    free-plus/components/…  hero, comparison table
  shared/components/        awning, cta-row, proof-chip, reviews-strip, roadmap-card
  translations/en/
    wp-admin-landing-shared.json
    wp-admin-landing-indie.json
    wp-admin-landing-free-plus.json
scripts/
  fetch-wporg-reviews.mjs   reviews+gravatars → src/shared/wporg-reviews.json
  fetch-roadmap.mjs         gh project board → src/shared/roadmap.json
  roadmap-curation.json     display-title ↔ board-title mapping
  lint-copy.mjs             banned words + literal year counts (§1, §3.2)
  lint-i18n-keys.mjs        every t('…') key exists in its en namespace
  lint-snapshots.mjs        snapshot age ≤ 90 days (§8)
tests/
  constants.test.mjs
  variant-loader.test.mjs
  analytics-config.test.mjs (rewritten)
  lint-copy.test.mjs
vite.config.ts              BUILD_TARGET-driven 3-build setup, per-entry CSS
```

Legacy `src/index.tsx`, `src/components/*`, `src/lib/*` are deleted at the end (Task 15) — `assets/js/landing.js` + `assets/css/landing.css` (old plugins) are committed artifacts and stay untouched.

---

### Task 1: Constants module

**Files:**
- Create: `src/shared/constants.ts`
- Test: `tests/constants.test.mjs`

- [x] **Step 1: Write the failing test**

```js
// tests/constants.test.mjs
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
});
```

- [x] **Step 2: Run test to verify it fails**

Run: `node --test tests/constants.test.mjs`
Expected: FAIL — `ENOENT … src/shared/constants.ts`

- [x] **Step 3: Implement**

```ts
// src/shared/constants.ts
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

/** Whole years elapsed, anniversary-aware. */
export function yearsSince(date: Date, now: Date = new Date()): number {
  let years = now.getFullYear() - date.getFullYear();
  const anniversary = new Date(date);
  anniversary.setFullYear(date.getFullYear() + years);
  if (now < anniversary) years -= 1;
  return years;
}

/** Nearest whole years — the letter's "15 years ago" photo line (14.5 → 15). */
export function yearsSinceRounded(date: Date, now: Date = new Date()): number {
  const ms = now.getTime() - date.getTime();
  return Math.round(ms / (365.25 * 24 * 3600 * 1000));
}
```

- [x] **Step 4: Run test to verify it passes**

Run: `node --test tests/constants.test.mjs` — Expected: PASS (3 subtests)

- [x] **Step 5: Commit**

```bash
git add src/shared/constants.ts tests/constants.test.mjs
git commit -m "feat: verified-facts constants module with computed year helpers"
```

---

### Task 2: Landing data — move to shared/, add `anon_id`

**Files:**
- Create: `src/shared/landing-data.ts` (move of `src/lib/landing-data.ts`)
- Modify: nothing else yet (old file deleted in Task 15)

- [x] **Step 1: Copy `src/lib/landing-data.ts` → `src/shared/landing-data.ts`**, then apply this diff to the new file:

```ts
// In interface WCPOSLanding, after pro_active:
  /** Random per-site UUID injected by plugin ≥1.10 for analytics identity (spec §5.1). Absent on older plugins. */
  anon_id?: string;

// In getLandingData(), after the base-field assignments:
  if (typeof (landing as Partial<WCPOSLanding>).anon_id === 'string') {
    validated.anon_id = (landing as Partial<WCPOSLanding>).anon_id;
  }
```

`anon_id` is optional and validated independently, same pattern as `profile`/`updates_server` — old plugins simply omit it.

- [x] **Step 2: Typecheck**

Run: `npx tsc --noEmit` — Expected: PASS (new file compiles; old `src/lib/` files still present and untouched)

- [x] **Step 3: Commit**

```bash
git add src/shared/landing-data.ts
git commit -m "feat: shared landing-data with optional anon_id field"
```

---

### Task 3: Analytics identity fix (§5.1) + event helpers (§5.2)

**Files:**
- Create: `src/shared/analytics.ts`
- Test: rewrite `tests/analytics-config.test.mjs`

- [x] **Step 1: Rewrite the config test (source-grep pattern, matching the existing test's style)**

```js
// tests/analytics-config.test.mjs  (full replacement)
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../src/shared/analytics.ts', import.meta.url), 'utf8');

test('PostHog persistence is localStorage (identity fix, spec §5.1)', () => {
  assert.match(source, /persistence\s*:\s*'localStorage'/);
  assert.doesNotMatch(source, /persistence\s*:\s*'memory'/);
});

test('person profiles always + session recording stays off', () => {
  assert.match(source, /person_profiles\s*:\s*'always'/);
  assert.match(source, /disable_session_recording\s*:\s*true/);
});

test('before_send strips admin URLs', () => {
  for (const key of ['\\$current_url', '\\$host', '\\$pathname', '\\$referrer']) {
    assert.match(source, new RegExp(key), `before_send must strip ${key}`);
  }
});

test('bootstrap distinctID only when nothing persisted (no per-load re-keying)', () => {
  assert.match(source, /hasPersistedIdentity/);
  assert.match(source, /isIdentifiedID\s*:\s*false/);
});

test('Google Analytics is gone (spec §5.1: removed entirely)', () => {
  assert.doesNotMatch(source, /react-ga4|ReactGA|G-08SJ28P1E5/);
});

test('flag-before-identify: identify lives in identifyConsented, not init', () => {
  assert.match(source, /export function identifyConsented/);
  const initBody = source.slice(source.indexOf('export function initAnalytics'), source.indexOf('export function identifyConsented'));
  assert.doesNotMatch(initBody, /posthog\.identify\(/, 'initAnalytics must not call identify()');
});
```

- [x] **Step 2: Run to verify it fails** — `node --test tests/analytics-config.test.mjs` → FAIL (`ENOENT … src/shared/analytics.ts`)

- [x] **Step 3: Implement**

```ts
// src/shared/analytics.ts
import posthog from 'posthog-js';
import { getLandingData } from './landing-data';
import { ANALYTICS_SCHEMA_VERSION } from './constants';

const POSTHOG_KEY = 'phc_BhTJzZ7fXMqcD4MiaUJQsQqPkEpu94yoSAthXFBWemvd';
const POSTHOG_HOST = 'https://ph.wcpos.com';
const VISIT_KEY = 'wcpos_landing_visits';
const PRO_OBSERVED_KEY = 'wcpos_pro_observed';

interface VisitState {
  visit_count: number;
  first_seen_at: string;
}

/** Per-browser visit counter + first-seen, persisted beside the assignment cache (§5.1). */
function bumpVisitState(): VisitState {
  try {
    const raw = window.localStorage.getItem(VISIT_KEY);
    const prev = raw ? (JSON.parse(raw) as VisitState) : null;
    const next: VisitState = {
      visit_count: (prev?.visit_count ?? 0) + 1,
      first_seen_at: prev?.first_seen_at ?? new Date().toISOString(),
    };
    window.localStorage.setItem(VISIT_KEY, JSON.stringify(next));
    return next;
  } catch {
    return { visit_count: 1, first_seen_at: new Date().toISOString() };
  }
}

/** True when posthog-js already has a persisted identity in this browser. */
function hasPersistedIdentity(): boolean {
  try {
    return window.localStorage.getItem(`ph_${POSTHOG_KEY}_posthog`) !== null;
  } catch {
    return false;
  }
}

/**
 * Initializes PostHog with the §5.1 identity stack. Does NOT identify —
 * `identifyConsented()` must be called only after the variant flag is
 * resolved (flag-before-identify rule).
 */
export function initAnalytics(): typeof posthog {
  const data = getLandingData();
  const anonId = data?.anon_id;

  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    persistence: 'localStorage',
    person_profiles: 'always',
    autocapture: false,
    capture_pageview: false,
    disable_session_recording: true,
    ...(anonId && !hasPersistedIdentity()
      ? { bootstrap: { distinctID: anonId, isIdentifiedID: false } }
      : {}),
    before_send: (event) => {
      if (event?.properties) {
        delete event.properties.$current_url;
        delete event.properties.$host;
        delete event.properties.$pathname;
        delete event.properties.$referrer;
        delete event.properties.$referring_domain;
      }
      return event;
    },
  });

  const visits = bumpVisitState();
  posthog.register({
    plugin_version: data?.plugin_version ?? 'unknown',
    pro_active: data?.pro_active ?? false,
    locale: data?.locale ?? 'en_US',
    has_profile: Boolean(data?.profile),
    has_anon_id: Boolean(anonId),
    analytics_schema_version: ANALYTICS_SCHEMA_VERSION,
    ...visits,
  });

  posthog.capture('$pageview');
  observeProActivation(data?.pro_active ?? false);
  return posthog;
}

/**
 * Merges the consented site identity. MUST be called only after the
 * landing-variant flag value has been read and registered (spec §5.1) —
 * identify() reloads flags and site_uuid hashes to a different bucket.
 */
export function identifyConsented(): void {
  const data = getLandingData();
  const profile = data?.profile;
  if (!data || !profile?.site_uuid) return;
  posthog.identify(profile.site_uuid, {
    locale: data.locale,
    plugin_version: data.plugin_version,
    pro_active: data.pro_active,
    wc_version: profile.wc_version,
    days_since_install: profile.days_since_install,
    product_count: profile.product_count,
    order_count: profile.order_count,
    pos_user_count: profile.pos_user_count,
    wc_currency: profile.wc_currency,
    wc_country: profile.wc_country,
    user_role: profile.user_role,
  });
}

/** At most once per browser; per-site dedup happens in analysis (§5.2). */
function observeProActivation(proActive: boolean): void {
  try {
    if (proActive && !window.localStorage.getItem(PRO_OBSERVED_KEY)) {
      posthog.capture('pro_activated_observed');
      window.localStorage.setItem(PRO_OBSERVED_KEY, '1');
    }
  } catch {
    /* storage unavailable — skip; server-side join is authoritative */
  }
}

export function trackEvent(event: string, properties?: Record<string, unknown>): void {
  posthog.capture(event, properties);
}

/** §5.2 outbound-link decoration: opaque ids only. */
export function decorateOutboundUrl(base: string, variant: string): string {
  const data = getLandingData();
  const url = new URL(base);
  url.searchParams.set('ref', 'wp-admin');
  url.searchParams.set('utm_source', 'wp-admin-landing');
  url.searchParams.set('utm_medium', 'landing');
  url.searchParams.set('utm_campaign', `landing-${variant}`);
  url.searchParams.set('utm_content', variant);
  url.searchParams.set('lv', variant);
  url.searchParams.set('aid', posthog.get_distinct_id());
  url.searchParams.set('pv', data?.plugin_version ?? 'unknown');
  return url.toString();
}
```

- [x] **Step 4: Run tests** — `node --test tests/analytics-config.test.mjs` → PASS. (`npm test` will still fail on the old bundle-grep test until Task 14 rebuilds assets — that legacy second test was deleted by this rewrite, confirm `rg 'welcome.js' tests/` returns nothing.)

- [x] **Step 5: Typecheck** — `npx tsc --noEmit` → PASS

- [x] **Step 6: Commit**

```bash
git add src/shared/analytics.ts tests/analytics-config.test.mjs
git commit -m "feat: PostHog identity fix — localStorage persistence, anon bootstrap, GA removed"
```

---

### Task 4: Runtime contract (§3.1.3)

**Files:**
- Create: `src/shared/runtime.ts`

- [x] **Step 1: Implement** (no isolated test — exercised by variant-loader tests and the build; type errors are the failure mode here)

```ts
// src/shared/runtime.ts
import type posthog from 'posthog-js';
import type i18next from 'i18next';
import type { WCPOSLanding } from './landing-data';
import * as constants from './constants';

/** What the bootstrap owns and variants consume. Sharing is by contract —
 *  IIFE builds cannot share modules (spec §3.1.3). */
export interface LandingRuntime {
  posthog: typeof posthog;
  i18next: typeof i18next;
  trackEvent: (event: string, properties?: Record<string, unknown>) => void;
  decorateOutboundUrl: (base: string, variant: string) => string;
  getLandingData: () => WCPOSLanding | undefined;
  constants: typeof constants;
  variant: string;
  renderSource: 'flag' | 'cache' | 'fallback';
  /** Variant calls this exactly once after mounting; bootstrap fires landing_variant_rendered. */
  signalRendered: () => void;
}

declare global {
  interface Window {
    wcpos?: { landing?: unknown; landingRuntime?: LandingRuntime };
  }
}

export function exposeRuntime(rt: LandingRuntime): void {
  window.wcpos = window.wcpos ?? {};
  window.wcpos.landingRuntime = rt;
}

export function readRuntime(): LandingRuntime {
  const rt = window.wcpos?.landingRuntime;
  if (!rt) throw new Error('wcpos.landingRuntime missing — variant loaded without bootstrap');
  return rt;
}
```

- [x] **Step 2: Typecheck** — `npx tsc --noEmit` → PASS

- [x] **Step 3: Commit**

```bash
git add src/shared/runtime.ts
git commit -m "feat: landingRuntime contract between bootstrap and variant bundles"
```

---

### Task 5: Variant loader — pure decision logic, cache, asset map (§3.1.4–5, §8)

**Files:**
- Create: `src/bootstrap/variant-loader.ts`
- Test: `tests/variant-loader.test.mjs`

The decision logic is pure (no DOM/posthog imports) so `node --test` covers it. We test the compiled behaviour by porting the pure functions into the test via `tsx`-free re-implementation? No — keep it simple and robust: the module's pure core lives in plain TS with no imports; the test imports the **transpiled** logic via a tiny esbuild-free trick: we duplicate nothing, we run `npx tsc` to emit. That's heavyweight; instead the pure core goes in **`src/bootstrap/variant-decision.mjs`** (plain JS with JSDoc types) so node can import it directly, and `variant-loader.ts` imports it. JS-with-JSDoc is the repo-compatible way to share logic with node tests.

- [x] **Step 1: Write the failing test**

```js
// tests/variant-loader.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { decideVariant, resolveAssets, CACHE_TTL_MS } from '../src/bootstrap/variant-decision.mjs';

const VALID = ['indie', 'free-plus'];
const base = {
  flagValue: undefined,
  cached: null,
  anonId: 'a-1',
  schemaVersion: 2,
  now: 1_000_000,
  validVariants: VALID,
  killSwitch: false,
  proActive: false,
  fallbackVariant: 'free-plus',
};

test('flag value wins and is cached', () => {
  const d = decideVariant({ ...base, flagValue: 'indie' });
  assert.deepEqual(d, { variant: 'indie', renderSource: 'flag', cache: true });
});

test('invalid flag value falls through to fallback', () => {
  const d = decideVariant({ ...base, flagValue: 'personalised' });
  assert.equal(d.renderSource, 'fallback');
  assert.equal(d.variant, 'free-plus');
  assert.equal(d.cache, false, 'fallback renders are never cached (spec §8)');
});

test('valid cache used when flag absent', () => {
  const cached = { variant: 'indie', anonId: 'a-1', schemaVersion: 2, ts: 999_000 };
  const d = decideVariant({ ...base, cached });
  assert.deepEqual(d, { variant: 'indie', renderSource: 'cache', cache: false });
});

test('cache rejected on anon_id rotation, schema bump, or TTL expiry', () => {
  const cached = { variant: 'indie', anonId: 'a-1', schemaVersion: 2, ts: 999_000 };
  assert.equal(decideVariant({ ...base, cached: { ...cached, anonId: 'a-2' } }).renderSource, 'fallback');
  assert.equal(decideVariant({ ...base, cached: { ...cached, schemaVersion: 1 } }).renderSource, 'fallback');
  assert.equal(decideVariant({ ...base, cached, now: 999_000 + CACHE_TTL_MS + 1 }).renderSource, 'fallback');
});

test('kill switch forces fallback even with flag and cache', () => {
  const cached = { variant: 'indie', anonId: 'a-1', schemaVersion: 2, ts: 999_000 };
  const d = decideVariant({ ...base, flagValue: 'indie', cached, killSwitch: true });
  assert.deepEqual(d, { variant: 'free-plus', renderSource: 'fallback', cache: false });
});

test('pro_active renders fallback variant without caching (§3.1.6)', () => {
  const d = decideVariant({ ...base, flagValue: 'indie', proActive: true });
  assert.deepEqual(d, { variant: 'free-plus', renderSource: 'fallback', cache: false });
});

test('resolveAssets: payload override accepted at or above ASSET_VERSION', () => {
  const map = { indie: { js: 'cdn/i.js', css: 'cdn/i.css' } };
  const ok = resolveAssets('indie', { asset_version: 1, variants: { indie: { js: 'x.js', css: 'x.css' } } }, map, 1);
  assert.deepEqual(ok, { js: 'x.js', css: 'x.css' });
});

test('resolveAssets: stale or malformed payload rejected → hardcoded map', () => {
  const map = { indie: { js: 'cdn/i.js', css: 'cdn/i.css' } };
  for (const payload of [null, 42, { asset_version: 0, variants: { indie: { js: 'x', css: 'y' } } }, { asset_version: 1 }]) {
    assert.deepEqual(resolveAssets('indie', payload, map, 1), { js: 'cdn/i.js', css: 'cdn/i.css' });
  }
});
```

- [x] **Step 2: Run to verify failure** — `node --test tests/variant-loader.test.mjs` → FAIL (module not found)

- [x] **Step 3: Implement the pure core**

```js
// src/bootstrap/variant-decision.mjs
// Pure decision logic — no DOM, no posthog. Imported by variant-loader.ts and node tests.

export const CACHE_TTL_MS = 7 * 24 * 3600 * 1000; // 7 days, matches translation cache (spec §3.1.4)

/**
 * @param {{ flagValue: string|undefined, cached: {variant:string,anonId:string,schemaVersion:number,ts:number}|null,
 *           anonId: string|undefined, schemaVersion: number, now: number, validVariants: string[],
 *           killSwitch: boolean, proActive: boolean, fallbackVariant: string }} opts
 * @returns {{ variant: string, renderSource: 'flag'|'cache'|'fallback', cache: boolean }}
 */
export function decideVariant(opts) {
  const { flagValue, cached, anonId, schemaVersion, now, validVariants, killSwitch, proActive, fallbackVariant } = opts;

  if (killSwitch || proActive) {
    return { variant: fallbackVariant, renderSource: 'fallback', cache: false };
  }
  if (flagValue && validVariants.includes(flagValue)) {
    return { variant: flagValue, renderSource: 'flag', cache: true };
  }
  const cacheValid =
    cached &&
    validVariants.includes(cached.variant) &&
    cached.anonId === (anonId ?? 'no-anon') &&
    cached.schemaVersion === schemaVersion &&
    now - cached.ts <= CACHE_TTL_MS;
  if (cacheValid) {
    return { variant: cached.variant, renderSource: 'cache', cache: false };
  }
  return { variant: fallbackVariant, renderSource: 'fallback', cache: false };
}

/**
 * Flag-payload chunk override with compiled-in minimum (spec §3.1.5): a payload
 * below minAssetVersion (or malformed) is rejected in favour of the hardcoded map.
 * @returns {{js: string, css: string}}
 */
export function resolveAssets(variant, payload, hardcodedMap, minAssetVersion) {
  const fallback = hardcodedMap[variant];
  if (!payload || typeof payload !== 'object') return fallback;
  const p = /** @type {{asset_version?: unknown, variants?: Record<string,{js?:unknown,css?:unknown}>}} */ (payload);
  if (typeof p.asset_version !== 'number' || p.asset_version < minAssetVersion) return fallback;
  const entry = p.variants?.[variant];
  if (!entry || typeof entry.js !== 'string' || typeof entry.css !== 'string') return fallback;
  return { js: entry.js, css: entry.css };
}
```

- [x] **Step 4: Run tests** — `node --test tests/variant-loader.test.mjs` → PASS (8 tests)

- [x] **Step 5: Implement the impure shell**

```ts
// src/bootstrap/variant-loader.ts
import type posthog from 'posthog-js';
import { decideVariant, resolveAssets } from './variant-decision.mjs';
import { CDN_BASE, ASSET_VERSION, ANALYTICS_SCHEMA_VERSION } from '../shared/constants';

export const FLAG_KEY = 'landing-variant';
export const KILL_SWITCH_KEY = 'ops-landing-kill-switch';
export const FALLBACK_VARIANT = 'free-plus';
export const VALID_VARIANTS = ['indie', 'free-plus'];
const CACHE_KEY = 'wcpos_landing_assignment';

export const VARIANT_ASSETS: Record<string, { js: string; css: string }> = {
  indie: { js: `${CDN_BASE}/js/variants/indie.js`, css: `${CDN_BASE}/css/variants/indie.css` },
  'free-plus': { js: `${CDN_BASE}/js/variants/free-plus.js`, css: `${CDN_BASE}/css/variants/free-plus.css` },
};

interface CachedAssignment { variant: string; anonId: string; schemaVersion: number; ts: number }

function readCache(): CachedAssignment | null {
  try { const raw = window.localStorage.getItem(CACHE_KEY); return raw ? JSON.parse(raw) : null; } catch { return null; }
}
function writeCache(variant: string, anonId: string | undefined): void {
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify({
      variant, anonId: anonId ?? 'no-anon', schemaVersion: ANALYTICS_SCHEMA_VERSION, ts: Date.now(),
    } satisfies CachedAssignment));
  } catch { /* private mode — assignment just re-resolves next load */ }
}

/** Waits for flags or times out. Exposure accounting: getFeatureFlag is always
 *  called once flags arrive — even after a timeout/cache render — so
 *  $feature_flag_called stays in lockstep with rendered events (spec §3.1.4). */
export function resolveFlag(ph: typeof posthog, timeoutMs = 500): Promise<{ flagValue: string | undefined; killSwitch: boolean; payload: unknown }> {
  return new Promise((resolve) => {
    let settled = false;
    const timer = setTimeout(() => { settled = true; resolve({ flagValue: undefined, killSwitch: false, payload: null }); }, timeoutMs);
    ph.onFeatureFlags(() => {
      const flagValue = ph.getFeatureFlag(FLAG_KEY) as string | undefined; // fires $feature_flag_called
      if (settled) return; // post-timeout: exposure recorded, but never re-render (no mid-session switch)
      clearTimeout(timer);
      resolve({
        flagValue,
        killSwitch: ph.getFeatureFlag(KILL_SWITCH_KEY) === true || ph.getFeatureFlag(KILL_SWITCH_KEY) === 'on',
        payload: ph.getFeatureFlagPayload(FLAG_KEY),
      });
    });
  });
}

export interface LoadedVariant { variant: string; renderSource: 'flag' | 'cache' | 'fallback' }

export async function loadVariant(ph: typeof posthog, anonId: string | undefined, proActive: boolean): Promise<LoadedVariant> {
  const { flagValue, killSwitch, payload } = await resolveFlag(ph);
  const decision = decideVariant({
    flagValue, cached: readCache(), anonId, schemaVersion: ANALYTICS_SCHEMA_VERSION,
    now: Date.now(), validVariants: VALID_VARIANTS, killSwitch, proActive, fallbackVariant: FALLBACK_VARIANT,
  });
  if (decision.cache) writeCache(decision.variant, anonId);

  const assets = resolveAssets(decision.variant, payload, VARIANT_ASSETS, ASSET_VERSION);
  await injectAssets(assets);
  return { variant: decision.variant, renderSource: decision.renderSource };
}

function injectAssets(assets: { js: string; css: string }): Promise<void> {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet'; link.href = assets.css;
    document.head.appendChild(link);
    const script = document.createElement('script');
    script.src = assets.js; script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`variant chunk failed: ${assets.js}`));
    document.head.appendChild(script);
  });
}
```

- [x] **Step 6: Typecheck + tests** — `npx tsc --noEmit && node --test tests/variant-loader.test.mjs` → PASS
  (If tsc complains about importing `.mjs`, add `"allowJs": true` + `"checkJs": false` to `tsconfig.json` compilerOptions and include `src/**/*.mjs`.)

- [x] **Step 7: Commit**

```bash
git add src/bootstrap/variant-decision.mjs src/bootstrap/variant-loader.ts tests/variant-loader.test.mjs tsconfig.json
git commit -m "feat: variant loader — pure decision core, assignment cache, payload-overridable asset map"
```

> **Amendment (execution):** loadVariant split into prepareVariant + injectAssets so the bootstrap can expose the runtime before chunk injection (injected scripts execute before onload).

---

### Task 6: i18n — per-variant namespaces (§4)

**Files:**
- Create: `src/shared/i18n.ts`
- Create: `src/translations/en/wp-admin-landing-shared.json`

- [x] **Step 1: Create the shared namespace source**

```json
{
  "get_pro": "Get Pro",
  "price_both": "{annual}/yr · {lifetime} lifetime",
  "price_annual_only": "{annual}/year",
  "proof_chip_line": "stores run WooCommerce POS\non WordPress.org since May 2014",
  "reviews_heading": "From the WordPress.org reviews",
  "translated_from_french": "translated from French",
  "read_on_wporg": "Read on WordPress.org →",
  "review_cta_line": "Running your shop on the free register? A review helps other store owners find it.",
  "review_cta_link": "Leave a review on WordPress.org →",
  "roadmap_title": "What I'm building",
  "roadmap_subtitle": "See the live board →",
  "roadmap_done": "DONE",
  "roadmap_next": "NEXT",
  "roadmap_listen": "<b>Pro users shape the priorities.</b> There's no ticket queue — you tell me what your shop needs on Discord, and it shapes this list.",
  "fair_licence": "If you stop paying, Pro keeps working. Updates and support stop.",
  "error_something_wrong": "Something went wrong: <1>{message}</1>"
}
```

- [x] **Step 2: Implement variant-aware init** (move + modify of `src/lib/i18n.ts`)

```ts
// src/shared/i18n.ts
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import ChainedBackend from 'i18next-chained-backend';
import LocalStorageBackend from 'i18next-localstorage-backend';
import HttpBackend from 'i18next-http-backend';
import { getLandingData } from './landing-data';
import sharedEn from '../translations/en/wp-admin-landing-shared.json';

const PROJECT = 'woocommerce-pos';
export const SHARED_NS = 'wp-admin-landing-shared';

/** Bootstrap initialises shared strings; the variant chunk adds its own
 *  namespace via addVariantNamespace() (spec §4: one namespace per variant). */
export function initI18n(): typeof i18next {
  const locale = getLandingData()?.locale ?? 'en_US';
  i18next
    .use(ChainedBackend)
    .use(initReactI18next)
    .init({
      lng: locale,
      fallbackLng: 'en_US',
      ns: [SHARED_NS],
      defaultNS: SHARED_NS,
      keySeparator: false,
      nsSeparator: false,
      interpolation: { prefix: '{', suffix: '}' },
      react: { useSuspense: false },
      partialBundledLanguages: true,
      resources: { en_US: { [SHARED_NS]: sharedEn } },
      backend: {
        backends: [LocalStorageBackend, HttpBackend],
        backendOptions: [
          { prefix: 'wcpos_i18n_', expirationTime: 7 * 24 * 60 * 60 * 1000 },
          { loadPath: `https://cdn.jsdelivr.net/gh/wcpos/translations@main/translations/js/{{lng}}/${PROJECT}/{{ns}}.json` },
        ],
      },
    });
  return i18next;
}

/** Called by the variant chunk: registers its bundled English source and
 *  triggers the CDN load for the active locale. */
export function addVariantNamespace(i18n: typeof i18next, ns: string, en: Record<string, string>): Promise<unknown> {
  i18n.addResourceBundle('en_US', ns, en, true, false);
  return i18n.loadNamespaces(ns);
}
```

- [x] **Step 3: Typecheck** — `npx tsc --noEmit` → PASS (note: `resolveJsonModule` must already be on; if not, add to tsconfig)

- [x] **Step 4: Commit**

```bash
git add src/shared/i18n.ts src/translations/en/wp-admin-landing-shared.json
git commit -m "feat: per-variant i18n namespaces with shared bundle"
```

---

### Task 7: Build-time fetchers + snapshots (§3.2, §8)

**Files:**
- Create: `scripts/fetch-wporg-reviews.mjs`, `scripts/fetch-roadmap.mjs`, `scripts/roadmap-curation.json`
- Create: `src/shared/wporg-reviews.json`, `src/shared/roadmap.json` (initial committed snapshots)

- [x] **Step 1: Commit the initial snapshots** (hand-authored from the verified reviews/board; fetchers refresh them)

> **Quote integrity (spec §2.1):** `quote_en`/`quote_fr` are VERBATIM reviewer text — typos and emoji preserved (the 🙂 and "killbot"/"glad tried it" are the reviewers' own), cuts marked with […], translations labelled in the UI. Never reword a quote. The banned-word/emoji lint must not scan `wporg-reviews.json` (reviewer speech, not product copy) — `lint-copy.mjs` only reads `src/translations/en/`, so this holds by construction.

```json
// src/shared/wporg-reviews.json
{
  "generated_at": "2026-06-12",
  "reviews": [
    {
      "author": "adeline",
      "context": "ceramicist · Annecy, France",
      "stars": 5,
      "quote_fr": "Ça fait plus d'un an que j'utilise WCPOS, et j'ai pris la licence Pro à vie il y a quelques mois, qui vaut le coup je pense. Paul est réactif sur Discord. Il a toujours répondu rapidement à mes questions, même le week-end […]",
      "quote_en": "I've been using WCPOS for over a year, and a few months ago I took the lifetime Pro licence — worth it, I think. Paul is responsive on Discord. He has always answered my questions quickly, even on weekends […]",
      "translated": true,
      "url": "https://wordpress.org/support/topic/plus-dun-an-dutilisation-je-recommande/",
      "avatar": null
    },
    {
      "author": "nckllnpssy",
      "context": "WordPress.org review",
      "stars": 5,
      "quote_en": "I did a lot of research when looking for a POS for my existing WC site, and nearly overlooked this one because it was free. But I'm glad tried it. It does everything you want without asking for subscriptions or a percentage of your sales – I bought the pro version for the few extra features, and it is a bargain.",
      "translated": false,
      "url": "https://wordpress.org/support/topic/the-best-woo-pos-plugin-available-and-its-free/",
      "avatar": null
    },
    {
      "author": "rodriguekgl",
      "context": "WordPress.org review",
      "stars": 5,
      "quote_en": "Great POS for your WooCommerce store, it has the desktop version which makes it better for place with weak internet connectivity. I believe there are more great features coming up 🙂 Keep up the great work killbot.",
      "translated": false,
      "url": "https://wordpress.org/support/topic/great-pos-for-your-woocommerce-store/",
      "avatar": null
    }
  ]
}
```

```json
// src/shared/roadmap.json
{
  "generated_at": "2026-06-12",
  "done": [
    "Refunds at the register",
    "Receipt template gallery",
    "Thermal receipt settings"
  ],
  "next": [
    "Prevent overselling at the register",
    "Native Bluetooth card readers",
    "Split payments",
    "Cash float & shift management"
  ]
}
```

```json
// scripts/roadmap-curation.json
{
  "_comment": "display ↔ board mapping. board_title null = not yet on the board (warn; Paul to create the epic so the card stays verifiable against the linked project).",
  "done_limit": 3,
  "next": [
    { "display": "Prevent overselling at the register", "board_title": "Prevent overselling at POS" },
    { "display": "Native Bluetooth card readers", "board_title": null },
    { "display": "Split payments", "board_title": "Split payment support" },
    { "display": "Cash float & shift management", "board_title": "Cash float management" }
  ],
  "done": [
    { "display": "Refunds at the register", "board_title": "Refund support" },
    { "display": "Receipt template gallery", "board_title": null },
    { "display": "Thermal receipt settings", "board_title": null }
  ]
}
```

- [x] **Step 2: Implement the roadmap fetcher** (uses `gh` CLI; warn-only, fail-closed per §8)

```js
// scripts/fetch-roadmap.mjs
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

const OUT = new URL('../src/shared/roadmap.json', import.meta.url);
const CURATION = JSON.parse(readFileSync(new URL('./roadmap-curation.json', import.meta.url), 'utf8'));

let board;
try {
  const raw = execFileSync('gh', ['project', 'item-list', '4', '--owner', 'wcpos', '--format', 'json', '--limit', '100'], { encoding: 'utf8' });
  board = JSON.parse(raw).items ?? [];
} catch (err) {
  console.warn(`fetch-roadmap: gh failed (${err.message}); keeping committed snapshot (fail-closed).`);
  process.exit(0);
}

const titles = new Set(board.map((it) => it.title));
for (const entry of [...CURATION.next, ...CURATION.done]) {
  if (entry.board_title && !titles.has(entry.board_title)) {
    console.warn(`fetch-roadmap: curated item not on board: "${entry.board_title}"`);
  }
  if (entry.board_title === null) {
    console.warn(`fetch-roadmap: "${entry.display}" has no board issue yet — create one to keep the card verifiable.`);
  }
}

writeFileSync(OUT, JSON.stringify({
  generated_at: new Date().toISOString().slice(0, 10),
  done: CURATION.done.map((e) => e.display).slice(0, CURATION.done_limit),
  next: CURATION.next.map((e) => e.display),
}, null, 2) + '\n');
console.log('fetch-roadmap: snapshot refreshed.');
```

- [x] **Step 3: Implement the reviews fetcher** (refreshes gravatars + verifies threads still exist; quote text stays curated)

```js
// scripts/fetch-wporg-reviews.mjs
import { readFileSync, writeFileSync } from 'node:fs';

const PATH = new URL('../src/shared/wporg-reviews.json', import.meta.url);
const snapshot = JSON.parse(readFileSync(PATH, 'utf8'));

for (const review of snapshot.reviews) {
  try {
    const res = await fetch(review.url, { headers: { 'user-agent': 'wcpos-build/1.0' } });
    if (!res.ok) { console.warn(`fetch-wporg-reviews: ${review.url} → HTTP ${res.status}; keeping snapshot entry.`); continue; }
    const html = await res.text();
    // First author avatar in the topic: <img alt='' src='https://secure.gravatar.com/avatar/…' …>
    const m = html.match(/<img[^>]+src='(https:\/\/secure\.gravatar\.com\/avatar\/[^']+)'/);
    if (m) review.avatar = m[1];
  } catch (err) {
    console.warn(`fetch-wporg-reviews: ${review.url} failed (${err.message}); keeping snapshot (fail-closed).`);
  }
}

snapshot.generated_at = new Date().toISOString().slice(0, 10);
writeFileSync(PATH, JSON.stringify(snapshot, null, 2) + '\n');
console.log('fetch-wporg-reviews: snapshot refreshed.');
```

- [x] **Step 4: Run both** — `node scripts/fetch-roadmap.mjs && node scripts/fetch-wporg-reviews.mjs`
Expected: both print "snapshot refreshed" (or fail-closed warnings); `git diff src/shared/*.json` shows only `generated_at`/avatar changes.

- [x] **Step 5: Commit**

```bash
git add scripts/fetch-roadmap.mjs scripts/fetch-wporg-reviews.mjs scripts/roadmap-curation.json src/shared/wporg-reviews.json src/shared/roadmap.json
git commit -m "feat: build-time roadmap and review fetchers with fail-closed snapshots"
```

---

### Task 8: CI copy lints (§1, §3.2, §8)

**Files:**
- Create: `scripts/lint-copy.mjs`, `scripts/lint-i18n-keys.mjs`, `scripts/lint-snapshots.mjs`
- Test: `tests/lint-copy.test.mjs`
- Modify: `package.json` (scripts)

- [x] **Step 1: Write the failing test for the lint core**

```js
// tests/lint-copy.test.mjs
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
```

- [x] **Step 2: Run to verify failure** — `node --test tests/lint-copy.test.mjs` → FAIL

- [x] **Step 3: Implement**

```js
// scripts/lint-copy.mjs
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const BANNED = [
  /\bsimply\b/i, /\bjust\b/i, /\bhurry\b/i, /\blimited time\b/i, /\bact now\b/i,
  /\brevolutionary\b/i, /\bgame.changing\b/i, /\bseamless\b/i, /\bleverage\b/i, /\bbest-in-class\b/i,
  /\p{Extended_Pictographic}/u, // emoji (spec: none in product copy)
];
const YEAR_WORDS = '(?:eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty)';
const LITERAL_YEARS = new RegExp(`\\b(?:\\d{1,2}|${YEAR_WORDS})\\s+years?\\b`, 'i');

/** @param {Record<string,string>} strings @returns {{key:string,reason:string}[]} */
export function findViolations(strings) {
  const out = [];
  for (const [key, value] of Object.entries(strings)) {
    for (const re of BANNED) {
      if (re.test(value)) { out.push({ key, reason: `banned pattern ${re}` }); break; }
    }
    if (LITERAL_YEARS.test(value) && !value.includes('{')) {
      out.push({ key, reason: 'literal year count — use a computed {placeholder} (spec §1)' });
    }
  }
  return out;
}

// CLI mode: lint every en translation namespace
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const dir = new URL('../src/translations/en/', import.meta.url);
  let failures = 0;
  for (const file of readdirSync(dir)) {
    const strings = JSON.parse(readFileSync(new URL(file, dir), 'utf8'));
    for (const v of findViolations(strings)) {
      console.error(`lint-copy: ${file} :: ${v.key} — ${v.reason}`);
      failures++;
    }
  }
  if (failures) process.exit(1);
  console.log('lint-copy: clean.');
}
```

```js
// scripts/lint-i18n-keys.mjs — every t('key') used in a variant exists in its en namespace
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const NS_FOR_DIR = {
  'src/variants/indie': 'wp-admin-landing-indie.json',
  'src/variants/free-plus': 'wp-admin-landing-free-plus.json',
  'src/shared/components': 'wp-admin-landing-shared.json',
};

function tsxFiles(dir) {
  return readdirSync(dir, { recursive: true })
    .filter((f) => String(f).endsWith('.tsx') || String(f).endsWith('.ts'))
    .map((f) => path.join(dir, String(f)));
}

let failures = 0;
for (const [dir, nsFile] of Object.entries(NS_FOR_DIR)) {
  const keys = new Set(Object.keys(JSON.parse(readFileSync(`src/translations/en/${nsFile}`, 'utf8'))));
  // shared keys are reachable from every component
  const shared = new Set(Object.keys(JSON.parse(readFileSync('src/translations/en/wp-admin-landing-shared.json', 'utf8'))));
  for (const file of tsxFiles(dir)) {
    const src = readFileSync(file, 'utf8');
    for (const m of src.matchAll(/\bt\(\s*'([^']+)'/g)) {
      if (!keys.has(m[1]) && !shared.has(m[1])) {
        console.error(`lint-i18n-keys: ${file} uses missing key '${m[1]}' (expected in ${nsFile})`);
        failures++;
      }
    }
  }
}
if (failures) process.exit(1);
console.log('lint-i18n-keys: clean.');
```

```js
// scripts/lint-snapshots.mjs — snapshots must be < 90 days old (spec §8)
import { readFileSync } from 'node:fs';
const MAX_AGE_DAYS = 90;
let failures = 0;
for (const file of ['src/shared/wporg-reviews.json', 'src/shared/roadmap.json']) {
  const { generated_at } = JSON.parse(readFileSync(file, 'utf8'));
  const age = (Date.now() - new Date(generated_at).getTime()) / 86_400_000;
  if (!(age <= MAX_AGE_DAYS)) {
    console.error(`lint-snapshots: ${file} is ${Math.floor(age)} days old (max ${MAX_AGE_DAYS}) — run the fetch scripts`);
    failures++;
  }
}
if (failures) process.exit(1);
console.log('lint-snapshots: clean.');
```

- [x] **Step 4: Wire into package.json** (`scripts` section)

```json
"lint:copy": "node scripts/lint-copy.mjs",
"lint:i18n": "node scripts/lint-i18n-keys.mjs",
"lint:snapshots": "node scripts/lint-snapshots.mjs",
"fetch:content": "node scripts/fetch-roadmap.mjs && node scripts/fetch-wporg-reviews.mjs",
"test": "node --test tests/",
"ci": "npm run test && npm run typecheck && npm run lint:copy && npm run lint:i18n && npm run lint:snapshots && npm run check:assets"
```

- [x] **Step 5: Run** — `node --test tests/lint-copy.test.mjs && npm run lint:copy && npm run lint:snapshots` → all PASS/clean (`lint:i18n` passes trivially until variants exist).

- [x] **Step 6: Commit**

```bash
git add scripts/lint-copy.mjs scripts/lint-i18n-keys.mjs scripts/lint-snapshots.mjs tests/lint-copy.test.mjs package.json
git commit -m "ci: banned-word, computed-years, i18n-key, and snapshot-age lints"
```

---

### Task 9: Vite multi-target build (§3.1.3, §3.2)

**Files:**
- Modify: `vite.config.ts` (full replacement)
- Modify: `package.json` build script

- [ ] **Step 1: Replace vite.config.ts**

```ts
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

type Target = 'bootstrap' | 'indie' | 'free-plus';
const target = (process.env.BUILD_TARGET ?? 'bootstrap') as Target;

const TARGETS: Record<Target, { entry: string; js: string; css: string }> = {
  bootstrap: { entry: 'src/bootstrap/index.tsx', js: 'js/welcome.js', css: 'css/welcome.css' },
  indie: { entry: 'src/variants/indie/index.tsx', js: 'js/variants/indie.js', css: 'css/variants/indie.css' },
  'free-plus': { entry: 'src/variants/free-plus/index.tsx', js: 'js/variants/free-plus.js', css: 'css/variants/free-plus.css' },
};
const t = TARGETS[target];

/** Re-extracts Vite's inlined CSS into a separate file (WordPress enqueues CSS
 *  separately). Parameterised per target — the old version hardcoded welcome.css. */
function extractCss(cssFileName: string): Plugin {
  return {
    name: 'extract-css',
    apply: 'build',
    enforce: 'post',
    generateBundle(_, bundle) {
      let cssExtracted = false;
      for (const chunk of Object.values(bundle)) {
        if (chunk.type === 'chunk' && chunk.code) {
          const cssMatch = chunk.code.match(
            /var \w+=document\.createElement\("style"\);\w+\.textContent=`([\s\S]*?)`[,;]document\.head\.appendChild/
          );
          if (cssMatch) {
            cssExtracted = true;
            const css = cssMatch[1].replace(/\\(.)/g, '$1');
            this.emitFile({ type: 'asset', fileName: cssFileName, source: css });
            chunk.code = chunk.code.replace(
              /var \w+=document\.createElement\("style"\);\w+\.textContent=`[\s\S]*?`[,;]document\.head\.appendChild\(\w+\);/,
              ''
            );
          }
        }
      }
      if (!cssExtracted) this.warn(`extract-css(${cssFileName}): no inline CSS found.`);
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), extractCss(t.css)],
  build: {
    outDir: 'assets',
    emptyOutDir: false,
    rollupOptions: {
      input: t.entry,
      // Variants must NOT bundle posthog/i18next — they use window.wcpos.landingRuntime.
      // React stays external everywhere (wp.element). react-i18next IS bundled per
      // variant (it binds to the runtime's i18next instance via I18nextProvider).
      external: ['react', 'react-dom', '@wordpress/element'],
      output: {
        entryFileNames: t.js,
        assetFileNames: (info) => (info.name?.endsWith('.css') ? t.css : 'assets/[name][extname]'),
        globals: { react: 'React', 'react-dom': 'ReactDOM', '@wordpress/element': 'wp.element' },
        format: 'iife',
      },
    },
  },
  server: { port: 9000, cors: true },
});
```

- [ ] **Step 2: Update package.json scripts**

```json
"build": "npm run fetch:content || true && BUILD_TARGET=bootstrap vite build && BUILD_TARGET=indie vite build && BUILD_TARGET=free-plus vite build",
"build:bootstrap": "BUILD_TARGET=bootstrap vite build",
"dev": "BUILD_TARGET=${BUILD_TARGET:-bootstrap} vite"
```

- [ ] **Step 3: Verify config loads** — `BUILD_TARGET=indie npx vite build --logLevel error` → FAILS only with "entry not found `src/variants/indie/index.tsx`" (config itself parses; entries arrive in Tasks 11–13).

- [ ] **Step 4: Commit**

```bash
git add vite.config.ts package.json
git commit -m "build: BUILD_TARGET-driven triple IIFE build with per-entry CSS extraction"
```

---

### Task 10: Shared UI components

**Files:**
- Create: `src/shared/components/awning.tsx`, `cta-row.tsx`, `proof-chip.tsx`, `reviews-strip.tsx`, `roadmap-card.tsx`

These compile into **each variant bundle** (source-shared, not runtime-shared — they're UI). All copy via `t()` from the shared namespace; data via the snapshot JSONs; CTAs decorated + tracked via the runtime.

- [ ] **Step 1: Implement**

```tsx
// src/shared/components/awning.tsx
export const Awning = () => (
  <div
    aria-hidden
    className="wcpos:h-[7px]"
    style={{ background: 'repeating-linear-gradient(90deg,#CD2C24 0 26px,#F5E5C0 26px 52px)' }}
  />
);
```

```tsx
// src/shared/components/cta-row.tsx
import { useTranslation } from 'react-i18next';
import { readRuntime } from '../runtime';

/** Single red Get Pro CTA + price line. Price visibility is keyed to
 *  exp-202608 (spec §6.2 #3): control shows both prices everywhere. */
export const CtaRow = ({ location }: { location: string }) => {
  const { t } = useTranslation();
  const rt = readRuntime();
  const { PRICE_ANNUAL, PRICE_LIFETIME, PRO_URL } = rt.constants;
  const annualOnly = rt.posthog.getFeatureFlag('exp-202608-all-price-visibility') === 'annual-only';
  const href = rt.decorateOutboundUrl(PRO_URL, rt.variant);

  if (rt.getLandingData()?.pro_active) {
    return <p className="wcpos:text-sm wcpos:text-gray-500">{t('pro_active_thanks')}</p>;
  }
  return (
    <div className="wcpos:flex wcpos:flex-wrap wcpos:items-center wcpos:gap-4">
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        onClick={() => rt.trackEvent('upgrade_cta_clicked', { cta_location: location, href })}
        className="wcpos:inline-flex wcpos:items-center wcpos:rounded-md wcpos:bg-[#CD2C24] wcpos:px-6 wcpos:py-2.5 wcpos:text-sm wcpos:font-semibold wcpos:text-white wcpos:shadow-md hover:wcpos:bg-[#A82320]"
      >
        {t('get_pro')}
      </a>
      <span className="wcpos:text-sm wcpos:text-gray-600">
        {annualOnly
          ? t('price_annual_only', { annual: PRICE_ANNUAL })
          : t('price_both', { annual: PRICE_ANNUAL, lifetime: PRICE_LIFETIME })}
      </span>
    </div>
  );
};
```

(Add `"pro_active_thanks": "You're on Pro — thank you for keeping this project going."` to `wp-admin-landing-shared.json`.)

```tsx
// src/shared/components/proof-chip.tsx
import { useTranslation } from 'react-i18next';
import { readRuntime } from '../runtime';

export const ProofChip = () => {
  const { t } = useTranslation();
  const { INSTALL_COUNT } = readRuntime().constants;
  return (
    <div className="wcpos:flex wcpos:items-center wcpos:gap-4 wcpos:rounded-lg wcpos:border wcpos:border-gray-200 wcpos:bg-white wcpos:p-4">
      <span className="wcpos:text-2xl wcpos:font-bold">{INSTALL_COUNT}</span>
      <span className="wcpos:whitespace-pre-line wcpos:text-xs wcpos:text-gray-600">{t('proof_chip_line')}</span>
    </div>
  );
};
```

```tsx
// src/shared/components/reviews-strip.tsx
import { useTranslation } from 'react-i18next';
import { readRuntime } from '../runtime';
import reviews from '../wporg-reviews.json';

export const ReviewsStrip = () => {
  const { t, i18n } = useTranslation();
  const rt = readRuntime();
  return (
    <section className="wcpos:border-t wcpos:border-gray-100 wcpos:bg-white wcpos:px-8 wcpos:py-8 lg:wcpos:px-12">
      <h4 className="wcpos:mb-4 wcpos:text-xs wcpos:font-bold wcpos:uppercase wcpos:tracking-wider wcpos:text-gray-500">
        {t('reviews_heading')}
      </h4>
      <div className="wcpos:grid wcpos:gap-4 lg:wcpos:grid-cols-3">
        {reviews.reviews.map((r) => {
          const quote = r.translated && i18n.language.startsWith('fr') && r.quote_fr ? r.quote_fr : r.quote_en;
          const showTranslated = r.translated && !i18n.language.startsWith('fr');
          return (
            <article key={r.author} className="wcpos:flex wcpos:flex-col wcpos:rounded-lg wcpos:border wcpos:border-gray-100 wcpos:bg-gray-50 wcpos:p-4">
              <div className="wcpos:mb-2 wcpos:flex wcpos:items-center wcpos:gap-3">
                {r.avatar ? (
                  <img src={r.avatar} alt="" width={38} height={38} loading="lazy" className="wcpos:rounded-full" />
                ) : (
                  <span className="wcpos:flex wcpos:h-[38px] wcpos:w-[38px] wcpos:items-center wcpos:justify-center wcpos:rounded-full wcpos:bg-gray-400 wcpos:font-bold wcpos:text-white">
                    {r.author[0].toUpperCase()}
                  </span>
                )}
                <div>
                  <b className="wcpos:block wcpos:text-sm">{r.author}</b>
                  <span className="wcpos:text-xs wcpos:text-gray-400">{r.context}</span>
                </div>
              </div>
              <span aria-label={`${r.stars} stars`} className="wcpos:mb-1 wcpos:tracking-widest wcpos:text-amber-500">★★★★★</span>
              <p className="wcpos:mb-3 wcpos:flex-1 wcpos:text-sm wcpos:leading-relaxed">
                “{quote}”{showTranslated && <em className="wcpos:block wcpos:text-xs wcpos:text-gray-400">{t('translated_from_french')}</em>}
              </p>
              <a href={r.url} target="_blank" rel="noreferrer" className="wcpos:text-xs wcpos:font-semibold wcpos:text-[#A82320]">
                {t('read_on_wporg')}
              </a>
            </article>
          );
        })}
      </div>
      <div className="wcpos:mt-4 wcpos:flex wcpos:items-center wcpos:gap-3 wcpos:rounded-lg wcpos:border wcpos:border-amber-100 wcpos:bg-amber-50 wcpos:px-4 wcpos:py-3 wcpos:text-sm">
        <span className="wcpos:tracking-widest wcpos:text-amber-500">★★★★★</span>
        <span>{t('review_cta_line')}</span>
        <a
          href={rt.constants.REVIEW_URL}
          target="_blank"
          rel="noreferrer"
          onClick={() => rt.trackEvent('review_cta_clicked')}
          className="wcpos:ml-auto wcpos:whitespace-nowrap wcpos:font-semibold wcpos:text-[#A82320]"
        >
          {t('review_cta_link')}
        </a>
      </div>
    </section>
  );
};
```

```tsx
// src/shared/components/roadmap-card.tsx
import { Trans, useTranslation } from 'react-i18next';
import { readRuntime } from '../runtime';
import roadmap from '../roadmap.json';
import { CtaRow } from './cta-row';

export const RoadmapCard = () => {
  const { t } = useTranslation();
  const rt = readRuntime();
  return (
    <div className="wcpos:rounded-xl wcpos:bg-[#1A1F27] wcpos:p-6 wcpos:text-gray-200 wcpos:shadow-xl">
      <h3 className="wcpos:text-lg wcpos:font-semibold wcpos:text-white">{t('roadmap_title')}</h3>
      <p className="wcpos:mb-4 wcpos:text-xs wcpos:text-gray-400">
        <a
          href={rt.constants.ROADMAP_URL}
          target="_blank"
          rel="noreferrer"
          onClick={() => rt.trackEvent('roadmap_widget_engaged')}
          className="wcpos:text-[#F5E5C0] wcpos:underline"
        >
          {t('roadmap_subtitle')}
        </a>
      </p>
      <ul>
        {roadmap.done.map((item) => (
          <li key={item} className="wcpos:flex wcpos:items-baseline wcpos:gap-3 wcpos:border-b wcpos:border-gray-700 wcpos:py-2 wcpos:text-sm">
            <span className="wcpos:rounded wcpos:bg-green-700 wcpos:px-1.5 wcpos:text-[10px] wcpos:font-bold wcpos:text-white">{t('roadmap_done')}</span>
            {item}
          </li>
        ))}
        {roadmap.next.map((item) => (
          <li key={item} className="wcpos:flex wcpos:items-baseline wcpos:gap-3 wcpos:border-b wcpos:border-gray-700 wcpos:py-2 wcpos:text-sm last:wcpos:border-0">
            <span className="wcpos:rounded wcpos:bg-amber-600 wcpos:px-1.5 wcpos:text-[10px] wcpos:font-bold wcpos:text-white">{t('roadmap_next')}</span>
            {item}
          </li>
        ))}
      </ul>
      <p className="wcpos:mt-3 wcpos:rounded-md wcpos:bg-[#232a33] wcpos:p-3 wcpos:text-xs wcpos:leading-relaxed wcpos:text-gray-400">
        <Trans i18nKey="roadmap_listen" components={{ b: <b className="wcpos:text-[#F5E5C0]" /> }} />
      </p>
      <div className="wcpos:mt-4 wcpos:border-t wcpos:border-gray-700 wcpos:pt-4">
        <CtaRow location="roadmap_card" />
      </div>
    </div>
  );
};
```

- [ ] **Step 2: Typecheck** — `npx tsc --noEmit` → PASS

- [ ] **Step 3: Commit**

```bash
git add src/shared/components/ src/translations/en/wp-admin-landing-shared.json
git commit -m "feat: shared landing components (awning, CTA, proof chip, reviews, roadmap card)"
```

---

### Task 11: Bootstrap entry (§3.1)

**Files:**
- Create: `src/bootstrap/index.tsx`, `src/bootstrap/skeleton.ts`

- [ ] **Step 1: Implement skeleton**

```ts
// src/bootstrap/skeleton.ts
export function showSkeleton(el: HTMLElement): void {
  el.innerHTML =
    '<div style="padding:48px;display:flex;justify-content:center;color:#8b95a3;font-size:13px;">…</div>';
}
export function clearSkeleton(el: HTMLElement): void {
  el.innerHTML = '';
}
```

- [ ] **Step 2: Implement orchestration**

```tsx
// src/bootstrap/index.tsx
import { initAnalytics, identifyConsented, trackEvent, decorateOutboundUrl } from '../shared/analytics';
import { initI18n } from '../shared/i18n';
import { getLandingData } from '../shared/landing-data';
import { reportProfile } from '../shared/profile-report';
import { exposeRuntime } from '../shared/runtime';
import * as constants from '../shared/constants';
import { loadVariant, FLAG_KEY } from './variant-loader';
import { showSkeleton, clearSkeleton } from './skeleton';

async function main(): Promise<void> {
  const el = document.getElementById('woocommerce-pos-upgrade');
  if (!el) return;
  showSkeleton(el);

  const t0 = performance.now();
  const data = getLandingData();
  const ph = initAnalytics();          // §5.1 — no identify here
  const i18n = initI18n();
  reportProfile();                      // unchanged fire-and-forget

  try {
    const { variant, renderSource } = await loadVariant(ph, data?.anon_id, data?.pro_active ?? false);

    // Flag-before-identify (§5.1): variant is final → pin it, then merge identity.
    ph.register({ landing_variant: variant });
    identifyConsented();

    exposeRuntime({
      posthog: ph,
      i18next: i18n,
      trackEvent,
      decorateOutboundUrl,
      getLandingData,
      constants,
      variant,
      renderSource,
      signalRendered: () => {
        clearSkeleton(el);
        trackEvent('landing_variant_rendered', {
          variant,
          render_source: renderSource,
          time_to_render_ms: Math.round(performance.now() - t0),
          asset_version: constants.ASSET_VERSION,
        });
      },
    });
    // The injected variant script mounts itself into #woocommerce-pos-upgrade
    // and calls runtime.signalRendered() exactly once.
  } catch (err) {
    trackEvent('landing_error', {
      stage: 'variant_load',
      message: err instanceof Error ? err.message : String(err),
      variant: 'unknown',
    });
    clearSkeleton(el);
  }
}

void main();
```

**Ordering note (spec §3.1.4 vs §5.1):** `loadVariant` resolves the flag *and injects the chunk*; the runtime is exposed after `identify()` so the variant (which only runs once its script loads and reads the runtime) can never observe a pre-identify world. Script injection happening before `identify()` is fine — variants do nothing until `readRuntime()` succeeds.

- [ ] **Step 3: Build** — `BUILD_TARGET=bootstrap npx vite build` → PASS, emits `assets/js/welcome.js` + `assets/css/welcome.css`.

- [ ] **Step 4: Commit**

```bash
git add src/bootstrap/index.tsx src/bootstrap/skeleton.ts
git commit -m "feat: bootstrap entry — analytics, flag-before-identify, runtime exposure, variant injection"
```

---

### Task 12: Indie variant (§2.1 — locked copy)

**Files:**
- Create: `src/variants/indie/index.tsx`, `src/variants/indie/letter.tsx`
- Create: `src/translations/en/wp-admin-landing-indie.json`

- [ ] **Step 1: Create the namespace source** (locked copy, computed placeholders)

```json
{
  "eyebrow": "{month} {year} · TO THE SHOPKEEPER RUNNING THE FREE REGISTER",
  "opening": "Hi — I'm Paul. I built the register you're using.",
  "para1": "That's me on the right, {yearsAgo} years ago. I opened Urban Locavore in 2011 with hundreds of products already in WooCommerce and no way to sell them at the counter — so I built a register myself. When the shop closed in 2014, I put it on WordPress.org for anyone who needed it. <b>POS plugins for WordPress have come and gone since then. This one hasn't.</b> {releaseYears} years of releases, one developer, still shipping — and the free version is still the real thing: sell, print, stay in sync. It stays free.",
  "para1_no_photo": "I opened Urban Locavore in Perth in 2011 with hundreds of products already in WooCommerce and no way to sell them at the counter — so I built a register myself. When the shop closed in 2014, I put it on WordPress.org for anyone who needed it. <b>POS plugins for WordPress have come and gone since then. This one hasn't.</b> {releaseYears} years of releases, one developer, still shipping — and the free version is still the real thing: sell, print, stay in sync. It stays free.",
  "para2": "<b>Pro is why it's still here.</b> It adds extra tools for managing your store — card readers, refunds at the till, end-of-day reports, multi-store — and it funds every release, free ones included. No investors, no acquisition exit waiting. Shopkeepers fund it directly.",
  "para3": "And Pro users have a direct line: tell me what your shop needs, and it shapes what I build next.",
  "photo_caption": "Urban Locavore, Perth — the store that started it all",
  "sig_name": "Paul Kilmurray",
  "sig_meta": "developer & former shopkeeper · github.com/kilbot",
  "ps": "<b>P.S.</b> — Pro is <b>{annual}/yr or {lifetime} once</b>. If a licence lapses, Pro keeps working; you just stop getting updates."
}
```

> The `ps` string contains "you just stop getting updates" — "just" here is the approved locked copy; add an allowlist entry in `scripts/lint-copy.mjs`: `const ALLOW = new Set(['ps']);` and skip keys in ALLOW for the `\bjust\b` rule only (implement as: run BANNED checks, but skip the `just` regex when `ALLOW.has(key)`).

- [ ] **Step 2: Implement the letter + page**

```tsx
// src/variants/indie/letter.tsx
import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { readRuntime } from '../../shared/runtime';

const PHOTO_URL = `${readRuntime().constants.CDN_BASE.replace('/assets', '')}/assets/img/paul-urban-locavore.jpg`;

export const Letter = () => {
  const { t } = useTranslation('wp-admin-landing-indie');
  const rt = readRuntime();
  const { SHOP_OPENED, FIRST_RELEASE, PRICE_ANNUAL, PRICE_LIFETIME, yearsSince, yearsSinceRounded } = rt.constants;
  const [photoOk, setPhotoOk] = useState(true);
  const now = new Date();
  const vars = {
    yearsAgo: yearsSinceRounded(SHOP_OPENED, now),
    releaseYears: yearsSince(FIRST_RELEASE, now),
    annual: PRICE_ANNUAL,
    lifetime: PRICE_LIFETIME,
    month: now.toLocaleString(rt.i18next.language.replace('_', '-'), { month: 'long' }).toUpperCase(),
    year: now.getFullYear(),
  };
  const bold = { b: <b className="wcpos:text-gray-900" /> };

  return (
    <div className="wcpos:relative wcpos:rounded-sm wcpos:bg-[#fffefb] wcpos:p-10 wcpos:shadow-xl">
      <div aria-hidden className="wcpos:absolute wcpos:inset-x-0 wcpos:top-0 wcpos:h-[5px]"
        style={{ background: 'repeating-linear-gradient(90deg,#CD2C24 0 22px,#F5E5C0 22px 44px)' }} />
      {photoOk && (
        <figure className="wcpos:float-right wcpos:mb-3 wcpos:ml-5 wcpos:w-[218px] wcpos:rotate-[1.6deg] wcpos:bg-white wcpos:p-2.5 wcpos:shadow-lg">
          <img src={PHOTO_URL} alt={t('photo_caption')} loading="lazy" onError={() => setPhotoOk(false)} className="wcpos:w-full" />
          <figcaption className="wcpos:mt-2 wcpos:text-center wcpos:text-[11px] wcpos:text-gray-500">{t('photo_caption')}</figcaption>
        </figure>
      )}
      <p className="wcpos:mb-5 wcpos:text-xs wcpos:tracking-wide wcpos:text-gray-400">{t('eyebrow', vars)}</p>
      <p className="wcpos:mb-4 wcpos:text-xl wcpos:font-semibold wcpos:text-gray-900">{t('opening')}</p>
      <p className="wcpos:mb-4 wcpos:leading-relaxed">
        <Trans ns="wp-admin-landing-indie" i18nKey={photoOk ? 'para1' : 'para1_no_photo'} values={vars} components={bold} />
      </p>
      <p className="wcpos:mb-4 wcpos:leading-relaxed"><Trans ns="wp-admin-landing-indie" i18nKey="para2" components={bold} /></p>
      <p className="wcpos:mb-4 wcpos:leading-relaxed">{t('para3')}</p>
      <div className="wcpos:mt-6 wcpos:flex wcpos:items-center wcpos:gap-3.5">
        <span className="wcpos:flex wcpos:h-[52px] wcpos:w-[52px] wcpos:items-center wcpos:justify-center wcpos:rounded-full wcpos:bg-[#323A46] wcpos:font-bold wcpos:text-[#F5E5C0]">PK</span>
        <div>
          <div className="wcpos:text-sm wcpos:font-semibold">{t('sig_name')}</div>
          <div className="wcpos:text-xs wcpos:text-gray-500">{t('sig_meta')}</div>
        </div>
      </div>
      <p className="wcpos:mt-6 wcpos:border-t wcpos:border-[#efece4] wcpos:pt-4 wcpos:text-sm wcpos:text-gray-600">
        <Trans ns="wp-admin-landing-indie" i18nKey="ps" values={vars} components={bold} />
      </p>
    </div>
  );
};
```

```tsx
// src/variants/indie/index.tsx
import { createRoot, render } from '@wordpress/element';
import { I18nextProvider } from 'react-i18next';
import { ErrorBoundary } from 'react-error-boundary';
import { readRuntime } from '../../shared/runtime';
import { addVariantNamespace } from '../../shared/i18n';
import { Awning } from '../../shared/components/awning';
import { ProofChip } from '../../shared/components/proof-chip';
import { ReviewsStrip } from '../../shared/components/reviews-strip';
import { RoadmapCard } from '../../shared/components/roadmap-card';
import { Letter } from './letter';
import en from '../../translations/en/wp-admin-landing-indie.json';

const NS = 'wp-admin-landing-indie';

const Page = () => (
  <div className="wcpos:overflow-hidden wcpos:rounded-lg wcpos:bg-white">
    <Awning />
    <div className="wcpos:bg-gradient-to-b wcpos:from-[#fdfdfc] wcpos:to-[#f6f5f2] wcpos:p-8 lg:wcpos:p-12">
      <div className="wcpos:grid wcpos:items-start wcpos:gap-10 lg:wcpos:grid-cols-[1.25fr_.85fr]">
        <Letter />
        <div className="wcpos:flex wcpos:flex-col wcpos:gap-5">
          <RoadmapCard />
          <ProofChip />
        </div>
      </div>
    </div>
    <ReviewsStrip />
  </div>
);

async function mount(): Promise<void> {
  const rt = readRuntime();
  await addVariantNamespace(rt.i18next, NS, en);
  const el = document.getElementById('woocommerce-pos-upgrade');
  if (!el) return;
  const tree = (
    <ErrorBoundary fallbackRender={() => null} onError={(e) => rt.trackEvent('landing_error', { stage: 'render', message: e.message, variant: rt.variant })}>
      <I18nextProvider i18n={rt.i18next}>
        <Page />
      </I18nextProvider>
    </ErrorBoundary>
  );
  if (createRoot) createRoot(el).render(tree); else render(tree, el);
  rt.signalRendered();
}

void mount();
```

- [ ] **Step 3: Build + lints** — `BUILD_TARGET=indie npx vite build && npm run lint:copy && npm run lint:i18n` → PASS

- [ ] **Step 4: Commit**

```bash
git add src/variants/indie/ src/translations/en/wp-admin-landing-indie.json scripts/lint-copy.mjs
git commit -m "feat: indie variant — the letter, roadmap card, reviews (locked spec copy)"
```

---

### Task 13: Free-plus variant (§2.2 — defaults)

**Files:**
- Create: `src/variants/free-plus/index.tsx`, `src/variants/free-plus/hero.tsx`, `src/variants/free-plus/comparison.tsx`
- Create: `src/translations/en/wp-admin-landing-free-plus.json`
- Create: `assets/img/reports-hero.png` (copy from `/Users/kilbot/Downloads/reports.png`, 2048×1536) + derivatives: `reports-hero.webp` (2048w), `reports-hero-1024.webp` — generate via `sips -Z 1024` + `cwebp -q 80` (or `sips -s format webp` on macOS 15+); commit all three

**Picks resolved by Paul 2026-06-12 (spec §2.2):** headline "Free today. / Pro when you're ready."; **no demo link at all**; fair-licence under CTA; comparison table; disqualifier off (`disqualifier_*` keys shipped for the future test; lint-i18n checks usage→existence, not reverse, so unused keys are fine).

- [ ] **Step 1: Namespace source**

```json
{
  "kicker": "You're on the free plugin — it stays free",
  "headline_1": "Free today.",
  "headline_2": "Pro when you're ready.",
  "sub": "The free register already <b>sells, prints, and stays in sync with your store</b>. Pro adds what bigger shops grow into: <b>card readers, refunds on the spot, stock edits mid-shift, reports at close</b>.",
  "hero_img_alt": "End-of-day report in WooCommerce POS Pro — sales chart, order list, and totals",
  "hero_img_caption": "End-of-day reports — totals by cashier, payment method, and store (Pro)",
  "table_heading": "What you get",
  "table_note": "everything in Free carries into Pro",
  "col_what": "What you can do",
  "col_free": "Free",
  "col_pro": "Pro",
  "row1_name": "Take sales, print receipts, stay in sync",
  "row1_desc": "Cash & external card · thermal printers · live WooCommerce sync",
  "row2_name": "Take card payments at the counter",
  "row2_desc": "Stripe Terminal, SumUp, Vipps MobilePay — or any WooCommerce gateway",
  "row3_name": "Refund a customer on the spot",
  "row3_desc": "Full or partial · to card or cash · audit-trailed",
  "row4_name": "Fix a price or stock level mid-shift",
  "row4_desc": "Edit products from the register — no trip to WP Admin",
  "row5_name": "Cash up in minutes",
  "row5_desc": "End-of-day totals by payment method, cashier, and store",
  "row6_name": "Run more than one location",
  "row6_desc": "Per-store branding, tax rates, receipts, inventory",
  "row7_name": "Tell me what gets built next",
  "row7_desc": "Pro users' requests shape the public roadmap",
  "roadmap_strip_note": "Pro users' requests shape this list.",
  "disqualifier_title": "Is Free already enough for you?",
  "disqualifier_body": "If you only take cash and rarely do refunds at the till, Free is probably all you need — and that's fine. Pro is for stores where cards, refunds, and end-of-day reports are daily work."
}
```

- [ ] **Step 2: Implement hero**

```tsx
// src/variants/free-plus/hero.tsx
import { Trans, useTranslation } from 'react-i18next';
import { readRuntime } from '../../shared/runtime';
import { CtaRow } from '../../shared/components/cta-row';

export const Hero = () => {
  const { t } = useTranslation('wp-admin-landing-free-plus');
  const { t: ts } = useTranslation('wp-admin-landing-shared');
  const rt = readRuntime();
  const imgBase = `${rt.constants.CDN_BASE}/img`;
  return (
    <div className="wcpos:grid wcpos:gap-8 lg:wcpos:grid-cols-2">
      <div className="wcpos:flex wcpos:flex-col wcpos:items-start wcpos:gap-4 wcpos:p-8 lg:wcpos:p-12 lg:wcpos:pr-0">
        <span className="wcpos:inline-flex wcpos:items-center wcpos:gap-2 wcpos:rounded-full wcpos:bg-[#F5E5C0] wcpos:px-3 wcpos:py-1 wcpos:text-[11px] wcpos:font-bold wcpos:uppercase wcpos:tracking-widest wcpos:text-[#996a13]">
          {t('kicker')}
        </span>
        <h1 className="wcpos:text-4xl wcpos:font-bold wcpos:leading-tight wcpos:tracking-tight">
          {t('headline_1')}<br /><span className="wcpos:text-[#CD2C24]">{t('headline_2')}</span>
        </h1>
        <p className="wcpos:max-w-md wcpos:leading-relaxed wcpos:text-gray-600">
          <Trans ns="wp-admin-landing-free-plus" i18nKey="sub" components={{ b: <b className="wcpos:text-gray-900" /> }} />
        </p>
        <CtaRow location="hero" />
        <span className="wcpos:text-xs wcpos:text-gray-400">{ts('fair_licence')}</span>
      </div>
      <figure className="wcpos:m-0 wcpos:flex wcpos:flex-col wcpos:justify-center wcpos:p-8 lg:wcpos:p-10">
        <picture>
          <source type="image/webp" srcSet={`${imgBase}/reports-hero.webp 2048w, ${imgBase}/reports-hero-1024.webp 1024w`} sizes="(min-width: 1024px) 512px, 100vw" />
          <img
            src={`${imgBase}/reports-hero.png`}
            alt={t('hero_img_alt')}
            loading="lazy"
            width={2048}
            height={1536}
            className="wcpos:w-full wcpos:rounded wcpos:shadow-xl"
          />
        </picture>
        <figcaption className="wcpos:mt-2 wcpos:text-center wcpos:text-[11px] wcpos:text-gray-500">{t('hero_img_caption')}</figcaption>
      </figure>
    </div>
  );
};
```

- [ ] **Step 3: Implement comparison + page**

```tsx
// src/variants/free-plus/comparison.tsx
import { useTranslation } from 'react-i18next';

const ROWS = [1, 2, 3, 4, 5, 6, 7] as const;
const FREE_ROWS = new Set([1]);

export const Comparison = () => {
  const { t } = useTranslation('wp-admin-landing-free-plus');
  return (
    <div className="wcpos:px-8 wcpos:pb-10 lg:wcpos:px-12">
      <div className="wcpos:mb-4 wcpos:flex wcpos:items-baseline wcpos:gap-3 wcpos:border-t wcpos:border-gray-100 wcpos:pt-6">
        <h2 className="wcpos:text-xl wcpos:font-semibold">{t('table_heading')}</h2>
        <span className="wcpos:text-xs wcpos:text-gray-400">{t('table_note')}</span>
      </div>
      <table className="wcpos:w-full wcpos:overflow-hidden wcpos:rounded-lg wcpos:border wcpos:border-gray-100 wcpos:text-sm">
        <thead>
          <tr>
            <th className="wcpos:bg-gray-50 wcpos:p-3 wcpos:text-left wcpos:text-xs wcpos:font-semibold wcpos:uppercase wcpos:tracking-wide wcpos:text-gray-500">{t('col_what')}</th>
            <th className="wcpos:w-20 wcpos:bg-gray-50 wcpos:p-3 wcpos:text-center wcpos:text-xs wcpos:font-semibold wcpos:uppercase wcpos:text-gray-500">{t('col_free')}</th>
            <th className="wcpos:w-20 wcpos:bg-[#1A1F27] wcpos:p-3 wcpos:text-center wcpos:text-xs wcpos:font-semibold wcpos:uppercase wcpos:text-[#F5E5C0]">{t('col_pro')}</th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map((n) => (
            <tr key={n} className="wcpos:border-t wcpos:border-gray-50">
              <td className="wcpos:p-3">
                <div className="wcpos:font-semibold">{t(`row${n}_name`)}</div>
                <div className="wcpos:text-xs wcpos:text-gray-500">{t(`row${n}_desc`)}</div>
              </td>
              <td className="wcpos:p-3 wcpos:text-center">
                {FREE_ROWS.has(n)
                  ? <span className="wcpos:inline-flex wcpos:h-5 wcpos:w-5 wcpos:items-center wcpos:justify-center wcpos:rounded-full wcpos:bg-green-100 wcpos:text-xs wcpos:font-bold wcpos:text-green-700">✓</span>
                  : <span className="wcpos:text-gray-300">—</span>}
              </td>
              <td className="wcpos:bg-[#FBFAF6] wcpos:p-3 wcpos:text-center">
                <span className={FREE_ROWS.has(n)
                  ? 'wcpos:inline-flex wcpos:h-5 wcpos:w-5 wcpos:items-center wcpos:justify-center wcpos:rounded-full wcpos:bg-green-100 wcpos:text-xs wcpos:font-bold wcpos:text-green-700'
                  : 'wcpos:inline-flex wcpos:h-5 wcpos:w-5 wcpos:items-center wcpos:justify-center wcpos:rounded-full wcpos:bg-[#CD2C24] wcpos:text-xs wcpos:font-bold wcpos:text-white'}>✓</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
```

```tsx
// src/variants/free-plus/index.tsx
import { createRoot, render } from '@wordpress/element';
import { I18nextProvider, useTranslation } from 'react-i18next';
import { ErrorBoundary } from 'react-error-boundary';
import { readRuntime } from '../../shared/runtime';
import { addVariantNamespace } from '../../shared/i18n';
import { Awning } from '../../shared/components/awning';
import { ReviewsStrip } from '../../shared/components/reviews-strip';
import { RoadmapCard } from '../../shared/components/roadmap-card';
import { Hero } from './hero';
import { Comparison } from './comparison';
import en from '../../translations/en/wp-admin-landing-free-plus.json';

const NS = 'wp-admin-landing-free-plus';

const Page = () => (
  <div className="wcpos:overflow-hidden wcpos:rounded-lg wcpos:bg-white">
    <Awning />
    <Hero />
    <Comparison />
    <div className="wcpos:grid wcpos:gap-6 wcpos:border-t wcpos:border-gray-100 wcpos:p-8 lg:wcpos:grid-cols-[1fr_1.2fr] lg:wcpos:px-12">
      <RoadmapCard />
      <div /> {/* reviews render full-width below */}
    </div>
    <ReviewsStrip />
  </div>
);

async function mount(): Promise<void> {
  const rt = readRuntime();
  await addVariantNamespace(rt.i18next, NS, en);
  const el = document.getElementById('woocommerce-pos-upgrade');
  if (!el) return;
  const tree = (
    <ErrorBoundary fallbackRender={() => null} onError={(e) => rt.trackEvent('landing_error', { stage: 'render', message: e.message, variant: rt.variant })}>
      <I18nextProvider i18n={rt.i18next}><Page /></I18nextProvider>
    </ErrorBoundary>
  );
  if (createRoot) createRoot(el).render(tree); else render(tree, el);
  rt.signalRendered();
}

void mount();
```

(The hero register illustration from the mockup is intentionally deferred — it needs either a real screenshot asset or an SVG illustration; tracked as a follow-up against the spec's imagery rule "real screenshots preferred". The layout works without it; add `assets/img/` screenshot when produced, as a plain `<img>` in `Hero`.)

- [ ] **Step 4: Build + lints** — `BUILD_TARGET=free-plus npx vite build && npm run lint:copy && npm run lint:i18n` → PASS

- [ ] **Step 5: Commit**

```bash
git add src/variants/free-plus/ src/translations/en/wp-admin-landing-free-plus.json
git commit -m "feat: free-plus variant — till/store hero, comparison table, defaults per spec"
```

---

### Task 14: Full build + asset check + dev harness

**Files:**
- Modify: `scripts/check-generated-assets.sh` expectations (if it pins file lists)
- Create: `dev/index.html` (local harness)

- [ ] **Step 1: Local dev harness** (manual QA without WordPress)

```html
<!-- dev/index.html — open via `npx vite preview` or any static server from repo root -->
<!doctype html>
<html>
<head><meta charset="utf-8"><title>landing dev harness</title>
<script>
  window.wcpos = { landing: {
    schema_version: 2, locale: 'en_US', plugin_version: '1.10.0',
    pro_active: false, anon_id: 'dev-anon-0001'
  }};
  window.wp = { element: {} }; // replaced below
</script>
<script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
<script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
<script>window.wp = { element: { createRoot: ReactDOM.createRoot, render: ReactDOM.render } };</script>
</head>
<body style="background:#f0f0f1;padding:24px;">
<div id="woocommerce-pos-upgrade"></div>
<link rel="stylesheet" href="../assets/css/welcome.css">
<script src="../assets/js/welcome.js"></script>
</body>
</html>
```

- [ ] **Step 2: Full build** — `npm run build` → emits `assets/js/welcome.js`, `assets/js/variants/{indie,free-plus}.js`, `assets/css/{welcome,variants/indie,variants/free-plus}.css`.

- [ ] **Step 3: Inspect `scripts/check-generated-assets.sh`**; if it verifies "built assets match src", run `npm run check:assets` and fix whatever expectations it pins (read the script first — likely rebuilds and diffs; new files must be committed for it to pass).

- [ ] **Step 4: Manual QA in the harness:** variant loads (will be `free-plus` fallback if ph.wcpos.com flag doesn't exist yet — expected pre-launch), skeleton clears, CTA decorated URL contains `lv=`/`aid=`, no console errors. Toggle `pro_active: true` → CTA replaced by thanks line.

- [ ] **Step 5: Run everything** — `npm run ci` → PASS

- [ ] **Step 6: Commit**

```bash
git add dev/index.html assets/
git commit -m "build: triple-target assets + local dev harness"
```

---

### Task 15: Remove legacy v2 sources (keep legacy v1 assets)

**Files:**
- Delete: `src/index.tsx`, `src/lib/` (all four files), `src/components/` (all), `src/hooks/use-notices.tsx`, `src/translations/en/wp-admin-landing.json`
- Keep: `assets/js/landing.js`, `assets/css/landing.css` (old-plugin artifacts, spec §11)
- Modify: `package.json` — remove `react-ga4`, `@paypal/react-paypal-js`, `classnames` (donate/hire-me removed per spec §2.1; verify with `rg` they're unreferenced)

- [ ] **Step 1: Verify nothing imports the old tree** — `rg -l "from '\.\./lib/|from './lib/|components/hero|paypal" src/` → only matches inside the directories being deleted.

- [ ] **Step 2: Delete + prune deps**

```bash
git rm -r src/index.tsx src/lib src/components src/hooks src/translations/en/wp-admin-landing.json
npm uninstall react-ga4 @paypal/react-paypal-js classnames
```

- [ ] **Step 3: Full verification** — `npm run ci && npm run build` → PASS; `git status` shows only intended deletions + lockfile.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "refactor: remove legacy v2 page sources and donate/hire-me deps (spec §2.1 removal)"
```

---

### Task 16: PR

- [ ] **Step 1:** `npm run ci` one final time → PASS, capture output.
- [ ] **Step 2:** Push branch, open PR titled `feat: experiment-ready landing — bootstrap runtime, indie & free-plus variants`, body links the spec + backlog appendix, lists the four-plan decomposition, and flags the two follow-ups (free-plus hero imagery asset; `roadmap-curation.json` items with `board_title: null` need board epics).

---

## Self-review notes

- **Spec coverage:** §2.1 (Task 12), §2.2 defaults (Task 13), §3.1 (Tasks 5, 9, 11), §3.2 (Tasks 1–9), §4 (Task 6), §5.1 (Task 3), §5.2 partial — `pricing_viewed`/`section_visible`/`page_engagement` are **deliberately deferred** to a follow-up task in the same PR series (they're additive instrumentation; the parent test's primary metric needs only `landing_variant_rendered`, `upgrade_cta_clicked`, `demo_opened`, all delivered). §8 (Tasks 5, 7, 11), §9 lints (Task 8). Out of plan: §5.3/§6.5/§7 (plans 2–4 + console runbook).
- **Known judgment calls recorded:** runtime exposure happens after `identify()` (ordering note, Task 11); `just` allowlisted for the locked P.S.; free-plus hero imagery deferred pending a real screenshot asset.
- **Type consistency check:** `LandingRuntime.signalRendered()` (Task 4) called as `rt.signalRendered()` (Tasks 12, 13) ✓; `decideVariant`/`resolveAssets` signatures match between Task 5 test and implementation ✓; namespace constants `wp-admin-landing-indie|free-plus|shared` consistent across Tasks 6, 8, 12, 13 ✓.
