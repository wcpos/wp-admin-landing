# Phase 1: Plumbing — Data Layer, Analytics, i18n Infrastructure

**Issue:** wcpos/wp-admin-landing#5
**Phase:** 1 of 3
**Scope:** Build tooling migration, data layer, PostHog analytics, profile reporting, conversion tracking, i18n setup
**Visual changes:** None — the page renders identically, but is instrumented and translatable

## Context

The wp-admin landing page is the primary free-to-Pro conversion funnel for WooCommerce POS. Issue #5 describes transforming it from a static page into a data-driven, personalised experience.

This spec covers Phase 1: the technical plumbing that subsequent phases depend on. Phase 2 (conversion redesign + personalisation) and Phase 3 (A/B testing) will be separate specs.

### Versioning strategy

- **Old plugin versions** load `wp-admin-landing/assets/` (untagged default branch, current static page)
- **Plugin 1.9.0+** loads `wp-admin-landing@v2/assets/` (tagged release with the new app)
- The v2 bundle should use `getLandingData()` which returns `undefined` if `window.wcpos.landing` is missing — all consumers degrade gracefully

### Dependencies

| Dependency | Status |
|---|---|
| `window.wcpos.landing` from free plugin | PR open: wcpos/woocommerce-pos#781 |
| PostHog instance | Issue open: wcpos/wcpos-infra#18 |
| Updates-server `POST /v1/profile` | Issue open: wcpos/updates-server#46 |

The app handles missing/malformed landing data gracefully — `getLandingData()` returns `undefined` and consumers (analytics, i18n, profile reporting) degrade to safe defaults.

---

## 1. Build: Webpack to Vite

### What changes

Replace the entire Webpack + Babel + ts-loader + postcss-loader toolchain with Vite.

### Why

Clean slate (v2 tag), small app, Vite handles TypeScript, CSS/PostCSS, and Tailwind natively with minimal config. Removes ~20 dev dependencies.

### Configuration (`vite.config.ts`)

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    outDir: 'assets',
    rollupOptions: {
      input: 'src/index.tsx',
      external: ['react', 'react-dom', '@wordpress/element'],
      output: {
        entryFileNames: 'js/welcome.js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) return 'css/welcome.css';
          return 'assets/[name][extname]';
        },
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          '@wordpress/element': 'wp.element',
        },
        format: 'iife',
      },
    },
  },
  server: {
    port: 9000,
    cors: true,
  },
});
```

### Output

- `assets/js/welcome.js` — new IIFE bundle for plugin 1.9.0+
- `assets/css/welcome.css` — new extracted CSS for plugin 1.9.0+
- `assets/js/landing.js` and `assets/css/landing.css` remain as legacy outputs for older plugin versions

### Files removed

- `webpack.config.js`
- `babel.config.js`
- `postcss.config.js` (PostCSS config moves inline or is handled by Vite Tailwind plugin)

### Dependencies removed

All webpack/babel dev dependencies (~20 packages): `webpack`, `webpack-cli`, `webpack-dev-server`, `webpack-bundle-analyzer`, `webpack-livereload-plugin`, `babel-loader`, `@babel/core`, `@babel/preset-env`, `@babel/preset-react`, `@babel/preset-typescript`, `@babel/plugin-transform-runtime`, `@babel/runtime`, `ts-loader`, `css-loader`, `style-loader`, `sass-loader`, `node-sass`, `postcss-loader`, `postcss-cli`, `mini-css-extract-plugin`, `css-minimizer-webpack-plugin`, `terser-webpack-plugin`, `fork-ts-checker-webpack-plugin`, `html-webpack-plugin`, `file-loader`, `@svgr/webpack`, `url-loader`.

### Dependencies added

- `vite`
- `@vitejs/plugin-react`
- `@tailwindcss/vite`

### Tailwind

Upgrade to Tailwind v4 (uses `@tailwindcss/vite` plugin, no separate PostCSS config). Tailwind v4 changes the prefix mechanism from dash-prefix (`wcpos-flex`) to variant-style prefix (`wcpos:flex`). All component class names are updated accordingly. The `tailwind.config.js` is removed — config moves to CSS (`@import "tailwindcss" prefix(wcpos)` + `@theme inline` for custom colors). Preflight is disabled by not importing it.

### Package manager

Keep Yarn (existing `.yarnrc.yml`). Update scripts:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

---

## 2. Data Layer

### `src/lib/landing-data.ts`

```typescript
export interface LandingProfile {
  locale: string;
  wc_version: string;
  plugin_version: string;
  days_since_install: number;
  product_count: number;
  order_count: number;
  pos_user_count: number;
  active_gateways: string[];
  pro_active: boolean;
  active_extensions: string[];
  php_version: string;
  site_uuid: string;
  user_uuid: string;
  user_role: string;
  wc_currency: string;
  wc_country: string;
}

export interface PostHogConfig {
  api_host: string;
  api_key: string;
}

export interface UpdatesServerConfig {
  profile_url: string;
}

export interface WCPOSLanding {
  schema_version: number;
  profile: LandingProfile;
  posthog?: PostHogConfig;
  updates_server?: UpdatesServerConfig;
}

declare global {
  interface Window {
    wcpos?: {
      landing?: unknown;
    };
  }
}

export function getLandingData(): WCPOSLanding | undefined {
  const landing = window.wcpos?.landing;
  return isLandingData(landing) ? landing : undefined;
}
```

### Design decisions

- **Safe getter with runtime validation.** `getLandingData()` validates the runtime shape and returns `undefined` for missing/malformed payloads so all consumers can degrade gracefully.
- **Global type augmentation + runtime checks.** `declare global` preserves editor typing, while `isLandingData()` remains the runtime safety boundary.
- **Sub-interfaces exported separately** (`LandingProfile`, `PostHogConfig`, `UpdatesServerConfig`) so consumers can import only what they need.

---

## 3. PostHog Analytics (replaces Google Analytics)

### `src/lib/analytics.ts`

```typescript
import posthog from 'posthog-js';
import { getLandingData } from './landing-data';

export function initAnalytics(): void {
  const data = getLandingData();
  const config = data?.posthog;
  const profile = data?.profile;
  if (!config?.api_key) return;

  posthog.init(config.api_key, {
    api_host: config.api_host,
    persistence: 'memory',
    autocapture: false,
    capture_pageview: false,
  });

  posthog.identify(profile.site_uuid, {
    locale: profile.locale,
    wc_version: profile.wc_version,
    plugin_version: profile.plugin_version,
    days_since_install: profile.days_since_install,
    product_count: profile.product_count,
    order_count: profile.order_count,
    pos_user_count: profile.pos_user_count,
    pro_active: profile.pro_active,
    wc_currency: profile.wc_currency,
    wc_country: profile.wc_country,
    user_role: profile.user_role,
  });

  posthog.capture('$pageview');
}

export function trackEvent(event: string, properties?: Record<string, unknown>): void {
  posthog.capture(event, properties);
}
```

### Design decisions

- **Conditional init on `api_key`.** PostHog infra (wcpos/wcpos-infra#18) may not be deployed when this ships. Empty `api_key` = skip init entirely.
- **`persistence: 'memory'`** — no cookies or localStorage in wp-admin context.
- **`autocapture: false`** — wp-admin has too many irrelevant elements. Explicit tracking only.
- **`trackEvent` helper** — thin wrapper so components don't import posthog directly. If PostHog isn't initialized, `posthog.capture` is a no-op.

### Removal

- Remove `react-ga4` from dependencies
- Remove GA initialize/send calls from `src/index.tsx`

---

## 4. Profile POST to Updates Server

### `src/lib/profile-report.ts`

```typescript
import { getLandingData } from './landing-data';

export function reportProfile(): void {
  const data = getLandingData();
  if (!data) return;

  const { updates_server, profile } = data;
  if (!updates_server?.profile_url) return;

  fetch(updates_server.profile_url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile),
  }).catch(() => {});
}
```

### Design decisions

- **Fire-and-forget.** Called on page load, no awaiting, silent catch. The updates-server endpoint (wcpos/updates-server#46) may not exist yet.
- **No retry, no queuing.** This runs on every page load anyway — if it fails once, it succeeds next time the user visits.

---

## 5. Conversion Event Tracking

Add `onClick` tracking to all existing CTA components:

| Component | Event name | Properties |
|---|---|---|
| Pro "Upgrade to Pro" button | `upgrade_cta_clicked` | — |
| PayPal donate button (amount selection) | `paypal_donate_clicked` | `{ amount: string }` |
| Review "Leave a Review" button | `review_link_clicked` | — |
| HireMe email link | `hire_me_clicked` | — |

### Implementation

Each component imports `trackEvent` from `src/lib/analytics.ts` and calls it in the existing `onClick` or wraps the `<a>` / `<Button>` with an onClick handler.

```typescript
import { trackEvent } from '../lib/analytics';

// In component:
<Button onClick={() => trackEvent('upgrade_cta_clicked')} href="...">
  Upgrade to Pro
</Button>
```

These events feed into PostHog funnels once PostHog is live. If PostHog isn't initialized (no api_key), the calls are no-ops.

---

## 6. i18n Infrastructure

### Approach

Vendor the `@wcpos/i18n` pattern (the package is private/workspace-only in the monorepo). The setup is small and self-contained.

### Dependencies added

- `i18next`
- `react-i18next`
- `i18next-chained-backend`
- `i18next-http-backend`
- `i18next-localstorage-backend`

### `src/lib/i18n.ts`

Sets up i18next with the same chained backend pattern used by the settings and analytics apps:

1. **LocalStorage** — cache with `wcpos_i18n_` prefix, 7-day expiry
2. **HTTP (jsdelivr CDN)** — `https://cdn.jsdelivr.net/gh/wcpos/translations@{version}/translations/js/{locale}/woocommerce-pos/wp-admin-landing.json`
3. **Bundled English** — embedded fallback so the page always renders

```typescript
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import ChainedBackend from 'i18next-chained-backend';
import LocalStorageBackend from 'i18next-localstorage-backend';
import HttpBackend from 'i18next-http-backend';
import { getLandingData } from './landing-data';
import en from '../translations/en/wp-admin-landing.json';

const NAMESPACE = 'wp-admin-landing';
const PROJECT = 'woocommerce-pos';

export function initI18n(): typeof i18next {
  const data = getLandingData();
  const locale = data?.profile?.locale ?? 'en_US';

  i18next
    .use(ChainedBackend)
    .use(initReactI18next)
    .init({
      lng: locale,
      fallbackLng: 'en_US',
      ns: [NAMESPACE],
      defaultNS: NAMESPACE,
      keySeparator: false,
      nsSeparator: false,
      interpolation: {
        prefix: '{',
        suffix: '}',
      },
      partialBundledLanguages: true,
      resources: {
        en_US: { [NAMESPACE]: en },
      },
      backend: {
        backends: [LocalStorageBackend, HttpBackend],
        backendOptions: [
          {
            prefix: 'wcpos_i18n_',
            expirationTime: 7 * 24 * 60 * 60 * 1000, // 7 days
          },
          {
            loadPath: `https://cdn.jsdelivr.net/gh/wcpos/translations@main/translations/js/{{lng}}/${PROJECT}/${NAMESPACE}.json`,
          },
        ],
      },
    });

  return i18next;
}
```

**Translation version:** Unlike the settings app (which pins translations to the plugin version), the landing page should always fetch the latest translations. This allows updating copy and translations without shipping a plugin update. The CDN path uses `@main` instead of a pinned version:

```text
https://cdn.jsdelivr.net/gh/wcpos/translations@main/translations/js/{locale}/woocommerce-pos/wp-admin-landing.json
```

jsdelivr caches `@branch` references for ~24h, so translation updates propagate within a day. No `translationVersion` field is needed in the data contract.

### Translation source file

Create `src/translations/en/wp-admin-landing.json` containing all current English strings extracted from components. This file also gets added to `source/js/woocommerce-pos/wp-admin-landing.json` in the [wcpos/translations](https://github.com/wcpos/translations) repo to trigger the translation pipeline.

### Component usage

```typescript
import { useTranslation } from 'react-i18next';

export const Pro = () => {
  const { t } = useTranslation();
  return (
    <h2>{t('upgrade_to_pro')}</h2>
    // ...
  );
};
```

All hardcoded English strings in existing components get wrapped with `t()`. The English JSON file maps keys to the current English text, so the page renders identically.

---

## 7. Cleanup

### Files removed
- `webpack.config.js`
- `babel.config.js`
- `postcss.config.js`
- `src/translations/index.ts` (dead Transifex integration)
- `src/translations/locales.json` (900+ locale mappings, unused)

### Externals updated
- Remove `@transifex/native` external (no more webpack, and Transifex is not used)
- Vite externals: `react`, `react-dom`, `@wordpress/element`

### Dependencies removed
- `react-ga4`
- All webpack/babel packages (~20)
- `node-sass`, `sass-loader` (switch to modern Sass via Vite if needed, or drop SCSS — current code only uses CSS)

---

## Entry point (`src/index.tsx`)

After all changes, the entry point looks roughly like:

```typescript
import { createRoot, render } from '@wordpress/element';
import { ErrorBoundary } from 'react-error-boundary';

import { initAnalytics } from './lib/analytics';
import { initI18n } from './lib/i18n';
import { reportProfile } from './lib/profile-report';
import Error from './components/error';
import App from './components/app';

import './index.css';

// Initialize services (non-blocking)
initAnalytics();
initI18n();
reportProfile();

const Root = () => (
  <ErrorBoundary FallbackComponent={Error}>
    <App />
  </ErrorBoundary>
);

const el = document.getElementById('woocommerce-pos-upgrade');
if (createRoot) {
  createRoot(el).render(<Root />);
} else {
  render(<Root />, el);
}
```

---

## Out of scope (Phase 2+)

- Page redesign / conversion optimisation
- Profile-driven personalisation
- PostHog feature flags / A/B testing
- New content or layout changes
- React upgrade (staying on 18)
