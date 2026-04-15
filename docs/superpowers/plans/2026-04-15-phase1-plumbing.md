# Phase 1: Plumbing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate from Webpack to Vite, upgrade Tailwind v3 to v4, add typed data layer for `window.wcpos.landing`, replace Google Analytics with PostHog, add profile reporting, conversion event tracking, and i18n infrastructure — with zero visual changes.

**Architecture:** The app reads static data from `window.wcpos.landing` (injected by plugin 1.9.0+) and uses it to initialize PostHog analytics, report the store profile to the updates server, and configure i18n. All services initialize at boot in `src/index.tsx` and are consumed by components via simple imports. No React context or state management needed for this phase.

**Tech Stack:** Vite, React 18.2, TypeScript, Tailwind CSS 4.x (`@tailwindcss/vite`), PostHog (`posthog-js`), i18next + react-i18next, jsdelivr CDN for translations.

**Spec:** `docs/superpowers/specs/2026-04-15-phase1-plumbing-design.md`

---

## Tailwind v4 Prefix Migration

Tailwind v4 changes the prefix mechanism. The old `wcpos-` dash-prefix becomes a `wcpos:` variant-style prefix:

- **v3:** `wcpos-flex wcpos-bg-gray-50 hover:wcpos-bg-blue-500 lg:wcpos-col-span-8`
- **v4:** `wcpos:flex wcpos:bg-gray-50 wcpos:hover:bg-blue-500 wcpos:lg:col-span-8`

Key rules:
- The prefix goes **before** all modifiers: `wcpos:hover:bg-blue-500` (not `hover:wcpos:bg-blue-500`)
- The prefix uses a colon, not a dash
- Every Tailwind utility class needs the prefix (to avoid collisions with WordPress admin CSS)

All component files in this plan use the v4 prefix syntax.

---

## File Map

### New files

| File | Responsibility |
|---|---|
| `vite.config.ts` | Vite build config with externals, output paths, dev server |
| `src/lib/landing-data.ts` | TypeScript types + `getLandingData()` accessor for `window.wcpos.landing` |
| `src/lib/analytics.ts` | PostHog init, identify, `trackEvent()` helper |
| `src/lib/profile-report.ts` | Fire-and-forget POST of profile to updates-server |
| `src/lib/i18n.ts` | i18next setup with chained backend (localStorage + CDN + bundled English) |
| `src/translations/en/wp-admin-landing.json` | English source strings extracted from all components |

### Modified files

| File | Changes |
|---|---|
| `package.json` | Remove webpack/babel deps, add vite/tailwind4/posthog/i18next deps, update scripts |
| `tsconfig.json` | Update for Vite compatibility |
| `src/index.tsx` | Remove react-ga4, call `initAnalytics()`, `initI18n()`, `reportProfile()`, update classes to v4 prefix |
| `src/index.css` | Replace `@tailwind` directives with `@import "tailwindcss"`, add prefix + theme config, disable preflight |
| `src/components/hero.tsx` | Wrap strings with `t()`, update class prefix |
| `src/components/pro.tsx` | Wrap strings with `t()`, add `trackEvent`, update class prefix |
| `src/components/paypal-button.tsx` | Wrap strings with `t()`, add `trackEvent`, update class prefix |
| `src/components/review.tsx` | Wrap strings with `t()`, add `trackEvent`, update class prefix |
| `src/components/hire-me.tsx` | Wrap strings with `t()`, add `trackEvent`, update class prefix |
| `src/components/button.tsx` | Add optional `onClick` prop, fix rel bug, update class prefix |
| `src/components/error.tsx` | Wrap strings with `t()`, update class prefix |
| `src/components/badge.tsx` | Add types, update class prefix |
| `src/components/notice.tsx` | Update class prefix |
| `src/hooks/use-notices.tsx` | Update React imports |

### Deleted files

| File | Reason |
|---|---|
| `webpack.config.js` | Replaced by `vite.config.ts` |
| `babel.config.js` | Vite handles transpilation |
| `postcss.config.js` | `@tailwindcss/vite` handles PostCSS |
| `tailwind.config.js` | Config moves to CSS (`src/index.css`) in Tailwind v4 |
| `src/translations/index.ts` | Dead Transifex code, replaced by `src/lib/i18n.ts` |
| `src/translations/locales.json` | Dead Transifex data, unused |
| `src/custom.d.ts` | SVG module declaration for webpack, not needed with Vite |

---

## Task 1: Migrate build from Webpack to Vite + Tailwind v4

**Files:**
- Create: `vite.config.ts`
- Modify: `package.json`
- Modify: `tsconfig.json`
- Modify: `src/index.css`
- Delete: `webpack.config.js`, `babel.config.js`, `postcss.config.js`, `tailwind.config.js`, `src/custom.d.ts`

- [ ] **Step 1: Remove old config files**

Delete these files:
- `webpack.config.js`
- `babel.config.js`
- `postcss.config.js`
- `tailwind.config.js`
- `src/custom.d.ts`

- [ ] **Step 2: Create `vite.config.ts`**

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    outDir: 'assets',
    emptyOutDir: true,
    rollupOptions: {
      input: 'src/index.tsx',
      external: ['react', 'react-dom', '@wordpress/element'],
      output: {
        entryFileNames: 'js/landing.js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) return 'css/landing.css';
          return 'assets/[name][extname]';
        },
        globals: {
          'react': 'React',
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

- [ ] **Step 3: Update `tsconfig.json`**

Replace the entire file:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["dom", "dom.iterable", "ESNext"],
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "sourceMap": true
  },
  "include": ["src"]
}
```

- [ ] **Step 4: Replace `src/index.css` with Tailwind v4 CSS config**

Replace the entire file:

```css
@import "tailwindcss" prefix(wcpos);

/*
 * Disable preflight — WordPress admin provides its own base styles.
 * In Tailwind v4, we do this by importing layers selectively.
 * The prefix(wcpos) on the @import line handles the prefix config.
 */
@layer theme, base, components, utilities;

/* Custom WordPress admin theme colors */
@theme inline {
  --color-wp-admin-theme-color: var(--wp-admin-theme-color, #007cba);
  --color-wp-admin-theme-color-darker-10: var(--wp-admin-theme-color-darker-10, #006ba1);
  --color-wp-admin-theme-color-darker-20: var(--wp-admin-theme-color-darker-20, #005a87);
  --color-wp-admin-theme-color-lightest: #e5f1f8;
  --color-wp-admin-theme-black: #1d2327;
}

/*
 * Reset box-sizing for elements inside our root container.
 * This replaces the old global reset that ran on *, ::before, ::after.
 */
#woocommerce-pos-upgrade *,
#woocommerce-pos-upgrade ::before,
#woocommerce-pos-upgrade ::after {
  box-sizing: border-box;
  border-width: 0;
  border-style: solid;
  border-color: #e5e7eb;
}

/*
 * Give JS 10 seconds to load before showing the error message.
 */
#woocommerce-pos-js-error {
  animation: 10s wcposError;
  animation-fill-mode: forwards;
  visibility: hidden;
}

@keyframes wcposError {
  99% {
    visibility: hidden;
  }
  100% {
    visibility: visible;
  }
}
```

Note: The `@import "tailwindcss" prefix(wcpos)` line sets the prefix. The `@theme inline` block defines custom colors available as `wcpos:bg-wp-admin-theme-color` etc. Preflight is disabled because we don't import it explicitly. The old `#woocommerce-pos-settings` table rule was removed — it referenced the settings page, not the landing page.

- [ ] **Step 5: Update `package.json`**

Remove all devDependencies. Remove `react-ga4` from dependencies. Remove `eslintConfig` and `packageManager` fields.

Add these devDependencies:
- `vite`
- `@vitejs/plugin-react`
- `@tailwindcss/vite`
- `tailwindcss` (v4)
- `@types/react` (latest 18.x)
- `@types/react-dom` (latest 18.x)
- `typescript` (^5.4)

Update scripts:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

- [ ] **Step 6: Update all component class names from `wcpos-` to `wcpos:` prefix**

This is a mechanical find-and-replace across all `.tsx` files. The rules:

1. `wcpos-` prefix on regular utilities becomes `wcpos:`:
   - `wcpos-flex` → `wcpos:flex`
   - `wcpos-bg-gray-50` → `wcpos:bg-gray-50`

2. Responsive/state modifiers move AFTER the prefix:
   - `lg:wcpos-col-span-8` → `wcpos:lg:col-span-8`
   - `hover:wcpos-bg-blue-500` → `wcpos:hover:bg-blue-500`
   - `focus-visible:wcpos-outline-none` → `wcpos:focus-visible:outline-none`
   - `focus:wcpos-ring-2` → `wcpos:focus:ring-2`

3. The `shadow` class (no prefix in current code) should be `wcpos:shadow`.

Apply this to every `.tsx` file in `src/components/` and `src/index.tsx`. Here are the updated class strings for each file:

**`src/index.tsx`** — App component classes:
```tsx
<div className="wcpos:w-full wcpos:py-4">
  <div className="wcpos:mx-auto wcpos:grid wcpos:gap-8 wcpos:lg:max-w-6xl wcpos:lg:grid-cols-12 wcpos:lg:px-6">
    <div className="wcpos:grid wcpos:gap-4 wcpos:lg:col-span-8 wcpos:lg:gap-2">
      <Hero />
    </div>
    <div className="wcpos:lg:col-span-4">
      <div className="wcpos:grid wcpos:gap-4">
```

**`src/components/badge.tsx`**:
```tsx
<div className="wcpos:inline-block wcpos:rounded-lg wcpos:bg-gray-300 wcpos:px-3 wcpos:py-1 wcpos:text-sm">
```

**`src/components/button.tsx`**:
```tsx
<a
  className="wcpos:w-full wcpos:inline-flex wcpos:h-10 wcpos:items-center wcpos:justify-center wcpos:rounded-md wcpos:bg-wp-admin-theme-color-darker-10 wcpos:px-8 wcpos:text-sm wcpos:font-medium wcpos:text-gray-50 wcpos:hover:text-gray-50 wcpos:shadow wcpos:transition-colors wcpos:hover:bg-wp-admin-theme-color-darker-20 wcpos:focus-visible:outline-none wcpos:focus-visible:ring-1 wcpos:focus-visible:ring-gray-950 wcpos:no-underline"
```

**`src/components/error.tsx`**:
```tsx
<div className="wcpos:p-4">
```

**`src/components/hero.tsx`**:
```tsx
<div className="wcpos:space-y-2 wcpos:lg:space-y-4">
```
```tsx
<p className="wcpos:text-3xl wcpos:font-bold wcpos:lg:text-4xl">
```
```tsx
<p className="wcpos:max-w-[900px] wcpos:text-xl wcpos:leading-8">
```
```tsx
<p className="wcpos:max-w-[900px] wcpos:text-base">
```
```tsx
<ul className="wcpos:max-w-[900px] wcpos:text-base">
```
```tsx
<span className="wcpos:text-2xl wcpos:mr-2">
```
```tsx
<span className="wcpos:text-gray-600">
```

**`src/components/hire-me.tsx`**:
```tsx
<div className="wcpos:bg-gray-50 wcpos:p-6 wcpos:rounded-lg">
```
```tsx
<h2 className="wcpos:text-2xl wcpos:font-semibold wcpos:m-0">
```
```tsx
<ul className="wcpos:list-disc wcpos:pl-6">
```

**`src/components/notice.tsx`**:
```tsx
'wcpos:flex wcpos:px-4 wcpos:py-2 wcpos:items-center',
status === 'error' && 'wcpos:bg-red-300 wcpos:border-l-4 wcpos:border-red-600',
status === 'info' && 'wcpos:bg-yellow-100 wcpos:border-l-4 wcpos:border-yellow-300',
status === 'success' && 'wcpos:bg-green-100 wcpos:border-l-4 wcpos:border-green-600'
```
```tsx
<div className="wcpos:flex-1">
```

**`src/components/paypal-button.tsx`**:
```tsx
<div className="wcpos:bg-gray-50 wcpos:p-6 wcpos:rounded-lg wcpos:space-y-4">
```
```tsx
<h2 className="wcpos:text-2xl wcpos:font-semibold wcpos:m-0">
```
```tsx
<div className="wcpos:flex wcpos:flex-wrap wcpos:gap-1">
```
Button classes inside the map:
```tsx
className={`wcpos:py-2 wcpos:px-4 wcpos:rounded-md ${
  (showCustomInput && amount === 'Other' && donationAmount !== 'Other') ||
  (!showCustomInput && donationAmount === amount)
    ? 'wcpos:bg-wp-admin-theme-color-darker-10 wcpos:text-white'
    : 'wcpos:bg-gray-200'
} wcpos:hover:bg-wp-admin-theme-color-darker-20 wcpos:hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
```
Note: the `focus:` classes without `wcpos:` prefix were in the original. They should be `wcpos:focus:outline-none wcpos:focus:ring-2 wcpos:focus:ring-blue-500 wcpos:focus:ring-offset-2`.

Custom input:
```tsx
className="wcpos:w-full wcpos:py-2 wcpos:px-4 wcpos:border wcpos:border-gray-300 wcpos:rounded-md wcpos:focus:outline-none wcpos:focus:ring-2 wcpos:focus:ring-wp-admin-theme-color-darker-10 wcpos:focus:ring-opacity-50"
```
Note: remove the old `wcpos-ring-blue-500` which was a duplicate/conflict.

**`src/components/pro.tsx`**:
```tsx
<div className="wcpos:bg-gray-50 wcpos:p-6 wcpos:rounded-lg">
```
```tsx
<h2 className="wcpos:text-2xl wcpos:font-semibold wcpos:m-0">
```
```tsx
<ul className="wcpos:list-disc wcpos:pl-6">
```

**`src/components/review.tsx`**:
```tsx
<div className="wcpos:bg-gray-50 wcpos:p-6 wcpos:rounded-lg wcpos:space-y-4">
```
```tsx
<h2 className="wcpos:text-2xl wcpos:font-semibold wcpos:m-0">
```

- [ ] **Step 7: Install dependencies and verify build**

```bash
yarn install
yarn build
```

Expected: Build succeeds, outputs `assets/js/landing.js` and `assets/css/landing.css`.

- [ ] **Step 8: Verify dev server**

```bash
yarn dev
```

Expected: Vite dev server starts on port 9000.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "build: migrate from webpack to vite, upgrade tailwind v3 to v4

Replace webpack + babel toolchain with Vite. Upgrade Tailwind CSS
from v3.3 to v4 with @tailwindcss/vite plugin. Prefix syntax changes
from wcpos-* to wcpos:* (variant-style prefix). CSS config replaces
tailwind.config.js. Remove ~20 dev dependencies."
```

---

## Task 2: Add data layer (`window.wcpos.landing` types + accessor)

**Files:**
- Create: `src/lib/landing-data.ts`

- [ ] **Step 1: Create `src/lib/landing-data.ts`**

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
  posthog: PostHogConfig;
  updates_server: UpdatesServerConfig;
}

declare global {
  interface Window {
    wcpos: {
      landing: WCPOSLanding;
    };
  }
}

export function getLandingData(): WCPOSLanding {
  return window.wcpos.landing;
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: No errors from this file.

- [ ] **Step 3: Commit**

```bash
git add src/lib/landing-data.ts
git commit -m "feat: add typed data layer for window.wcpos.landing

Types and accessor for the landing profile data injected by
plugin 1.9.0+. Includes global Window type augmentation."
```

---

## Task 3: Replace Google Analytics with PostHog

**Files:**
- Create: `src/lib/analytics.ts`
- Modify: `src/index.tsx`
- Modify: `package.json`

- [ ] **Step 1: Install posthog-js and remove react-ga4**

```bash
yarn add posthog-js
yarn remove react-ga4
```

- [ ] **Step 2: Create `src/lib/analytics.ts`**

```typescript
import posthog from 'posthog-js';
import { getLandingData } from './landing-data';

export function initAnalytics(): void {
  const { posthog: config, profile } = getLandingData();

  if (!config.api_key) return;

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

- [ ] **Step 3: Update `src/index.tsx` — remove GA, add analytics init**

Replace the full file content with:

```tsx
import { createRoot, render } from '@wordpress/element';
import { ErrorBoundary } from 'react-error-boundary';

import { initAnalytics } from './lib/analytics';
import Error from './components/error';
import { Hero } from './components/hero';
import { Pro } from './components/pro';
import { PayPalButton } from './components/paypal-button';
import { Review } from './components/review';
import { HireMe } from './components/hire-me';

import './index.css';

// Initialize analytics (non-blocking, no-op if PostHog not configured)
initAnalytics();

const App = () => {
  return (
    <div className="wcpos:w-full wcpos:py-4">
      <div className="wcpos:mx-auto wcpos:grid wcpos:gap-8 wcpos:lg:max-w-6xl wcpos:lg:grid-cols-12 wcpos:lg:px-6">
        <div className="wcpos:grid wcpos:gap-4 wcpos:lg:col-span-8 wcpos:lg:gap-2">
          <Hero />
        </div>
        <div className="wcpos:lg:col-span-4">
          <div className="wcpos:grid wcpos:gap-4">
            <Pro />
            <PayPalButton />
            <Review />
            <HireMe />
          </div>
        </div>
      </div>
    </div>
  );
};

const Root = () => {
  return (
    <ErrorBoundary FallbackComponent={Error}>
      <App />
    </ErrorBoundary>
  );
};

const el = document.getElementById('woocommerce-pos-upgrade');

if (createRoot) {
  createRoot(el!).render(<Root />);
} else {
  render(<Root />, el);
}
```

- [ ] **Step 4: Verify build**

```bash
yarn build
```

Expected: Build succeeds.

- [ ] **Step 5: Commit**

```bash
git add src/lib/analytics.ts src/index.tsx package.json yarn.lock
git commit -m "feat: replace Google Analytics with PostHog

Remove react-ga4. Add posthog-js with conditional init (skips
if no api_key configured). Identify by site_uuid with store
profile properties. Memory-only persistence for wp-admin context."
```

---

## Task 4: Add profile reporting to updates-server

**Files:**
- Create: `src/lib/profile-report.ts`
- Modify: `src/index.tsx`

- [ ] **Step 1: Create `src/lib/profile-report.ts`**

```typescript
import { getLandingData } from './landing-data';

export function reportProfile(): void {
  const { updates_server, profile } = getLandingData();

  if (!updates_server.profile_url) return;

  fetch(updates_server.profile_url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile),
  }).catch(() => {});
}
```

- [ ] **Step 2: Add `reportProfile()` call to `src/index.tsx`**

Add the import at the top with the other lib imports:

```typescript
import { reportProfile } from './lib/profile-report';
```

Add the call after `initAnalytics()`:

```typescript
// Initialize analytics (non-blocking, no-op if PostHog not configured)
initAnalytics();
// Report store profile to updates-server (fire-and-forget)
reportProfile();
```

- [ ] **Step 3: Verify build**

```bash
yarn build
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/profile-report.ts src/index.tsx
git commit -m "feat: add fire-and-forget profile POST to updates-server

Sends store profile data to updates_server.profile_url on page
load. Silent failure — endpoint may not exist yet."
```

---

## Task 5: Add conversion event tracking to CTA components

**Files:**
- Modify: `src/components/button.tsx`
- Modify: `src/components/pro.tsx`
- Modify: `src/components/paypal-button.tsx`
- Modify: `src/components/review.tsx`
- Modify: `src/components/hire-me.tsx`

- [ ] **Step 1: Update `src/components/button.tsx` — add onClick prop**

Replace the full file:

```tsx
interface ButtonProps {
  href: string;
  children: React.ReactNode;
  target?: string;
  onClick?: () => void;
}

export const Button = ({ href, children, target, onClick }: ButtonProps) => {
  return (
    <a
      className="wcpos:w-full wcpos:inline-flex wcpos:h-10 wcpos:items-center wcpos:justify-center wcpos:rounded-md wcpos:bg-wp-admin-theme-color-darker-10 wcpos:px-8 wcpos:text-sm wcpos:font-medium wcpos:text-gray-50 wcpos:hover:text-gray-50 wcpos:shadow wcpos:transition-colors wcpos:hover:bg-wp-admin-theme-color-darker-20 wcpos:focus-visible:outline-none wcpos:focus-visible:ring-1 wcpos:focus-visible:ring-gray-950 wcpos:no-underline"
      href={href}
      target={target}
      rel={target === '_blank' ? 'noopener noreferrer' : undefined}
      onClick={onClick}
    >
      {children}
    </a>
  );
};
```

Note: This also fixes a bug in the original: `rel={target = '_blank' && ...}` used assignment (`=`) instead of comparison (`===`).

- [ ] **Step 2: Update `src/components/pro.tsx` — add upgrade tracking**

Replace the full file:

```tsx
import { trackEvent } from '../lib/analytics';
import { Button } from './button';

export const Pro = () => {
  return (
    <div className="wcpos:bg-gray-50 wcpos:p-6 wcpos:rounded-lg">
      <h2 className="wcpos:text-2xl wcpos:font-semibold wcpos:m-0">Upgrade to Pro</h2>
      <ul className="wcpos:list-disc wcpos:pl-6">
        <li>Use any WooCommerce gateway</li>
        <li>Create multiple POS Stores</li>
        <li>Analytics for POS and Online sales</li>
        <li>Priority Discord support (usually &lt; 1 hour)</li>
      </ul>

      <Button
        href="https://wcpos.com/pro"
        target="_blank"
        onClick={() => trackEvent('upgrade_cta_clicked')}
      >
        Upgrade to Pro
      </Button>
    </div>
  );
};
```

- [ ] **Step 3: Update `src/components/paypal-button.tsx` — add donate tracking**

Add the import at the top of the file (alongside the existing React import):

```typescript
import { trackEvent } from '../lib/analytics';
```

Replace `import * as React from "react"` with named imports:

```typescript
import { useState, useEffect, useRef } from 'react';
```

Update the `useState`/`useEffect`/`useRef` calls to remove the `React.` prefix.

Update the class names to v4 prefix (see Task 1 Step 6 for exact strings).

Add tracking to the `handleCreateOrder` function:

```typescript
const handleCreateOrder = (data: any, actions: any) => {
  trackEvent('paypal_donate_clicked', { amount: currentDonationAmountRef.current });
  return actions.order.create({
    purchase_units: [
      {
        amount: {
          value: currentDonationAmountRef.current,
        },
      },
    ],
  });
};
```

- [ ] **Step 4: Update `src/components/review.tsx` — add review tracking**

Replace the full file:

```tsx
import { trackEvent } from '../lib/analytics';
import { Button } from './button';

export const Review = () => {
  const reviewPageUrl = 'https://wordpress.org/support/plugin/woocommerce-pos/reviews/#new-post';

  return (
    <div className="wcpos:bg-gray-50 wcpos:p-6 wcpos:rounded-lg wcpos:space-y-4">
      <h2 className="wcpos:text-2xl wcpos:font-semibold wcpos:m-0">Leave a review</h2>
      <p>We hope you're finding our plugin helpful. If you have a moment, please leave us a review on WordPress.org. It really helps us to keep improving and offering the best service possible!</p>

      <Button
        href={reviewPageUrl}
        target="_blank"
        onClick={() => trackEvent('review_link_clicked')}
      >
        Leave a Review
      </Button>
    </div>
  );
};
```

- [ ] **Step 5: Update `src/components/hire-me.tsx` — add hire tracking**

Replace the full file:

```tsx
import { trackEvent } from '../lib/analytics';

export const HireMe = () => {
  return (
    <div className="wcpos:bg-gray-50 wcpos:p-6 wcpos:rounded-lg">
      <h2 className="wcpos:text-2xl wcpos:font-semibold wcpos:m-0">Hire me!</h2>

      <p>I am available for Contract Work:</p>

      <ul className="wcpos:list-disc wcpos:pl-6">
        <li>Advanced knowledge in WordPress & WooCommerce (over 10 years experience)</li>
        <li>Proficient in React and React Native for modern web applications</li>
        <li>Expertise in custom plugin and block development (eg: Gutenberg)</li>
      </ul>

      Email{' '}
      <a
        href="mailto:paul@wcpos.com"
        onClick={() => trackEvent('hire_me_clicked')}
      >
        paul@wcpos.com
      </a>{' '}
      with your project.
    </div>
  );
};
```

- [ ] **Step 6: Verify build**

```bash
yarn build
```

- [ ] **Step 7: Commit**

```bash
git add src/components/
git commit -m "feat: add PostHog conversion event tracking to all CTAs

Track upgrade_cta_clicked, paypal_donate_clicked (with amount),
review_link_clicked, and hire_me_clicked. Events are no-ops when
PostHog is not initialized. Also fix assignment bug in Button rel attr."
```

---

## Task 6: Set up i18n infrastructure

**Files:**
- Create: `src/lib/i18n.ts`
- Create: `src/translations/en/wp-admin-landing.json`
- Modify: `src/index.tsx`
- Delete: `src/translations/index.ts`
- Delete: `src/translations/locales.json`

- [ ] **Step 1: Delete dead Transifex files**

Delete:
- `src/translations/index.ts`
- `src/translations/locales.json`

- [ ] **Step 2: Install i18n dependencies**

```bash
yarn add i18next react-i18next i18next-chained-backend i18next-http-backend i18next-localstorage-backend
```

- [ ] **Step 3: Create `src/translations/en/wp-admin-landing.json`**

```json
{
  "support_the_project": "Support the project",
  "hero_title": "WooCommerce POS needs your help!",
  "hero_description": "WooCommerce POS is the only free and open source Point of Sale plugin for WooCommerce. We believe in creating a high quality product that is accessible to everyone. However, it requires many thousands of hours for development and support. It's a big project and it needs your help to keep it going.",
  "ways_to_help": "There are several ways you can help support the project:",
  "upgrade_to_pro_label": "Upgrade to Pro:",
  "upgrade_to_pro_description": "Unlock advanced features and get premium support by upgrading to the Pro version. This is one of the best ways to support the project and ensure its ongoing development and improvement.",
  "donate_label": "Donate:",
  "donate_description": "If you love using WooCommerce POS and want to support the project financially, consider making a donation. Every little bit helps us continue development and provide support to users.",
  "leave_review_label": "Leave a review:",
  "leave_review_description": "Share your experience with WooCommerce POS by leaving a review on WordPress.org. Positive reviews help increase the visibility of the plugin and encourage more users to try it out.",
  "hire_me_label": "Hire me for contract work:",
  "hire_me_description": "If you have custom requirements or need expert assistance with your WooCommerce store, consider hiring me for contract work. Not only will you get tailored solutions for your needs, but you'll also be supporting the WooCommerce POS project directly.",
  "support_thanks": "Your support is crucial for the continued development and improvement of WooCommerce POS. Thank you for considering these options to help sustain this project.",
  "upgrade_to_pro": "Upgrade to Pro",
  "use_any_wc_gateway": "Use any WooCommerce gateway",
  "create_multiple_stores": "Create multiple POS Stores",
  "analytics_for_sales": "Analytics for POS and Online sales",
  "priority_discord_support": "Priority Discord support (usually < 1 hour)",
  "donate": "Donate",
  "other": "Other",
  "enter_donation_amount": "Enter donation amount",
  "donation_successful": "Donation successful! Thank you for your generosity.",
  "leave_a_review": "Leave a review",
  "review_description": "We hope you're finding our plugin helpful. If you have a moment, please leave us a review on WordPress.org. It really helps us to keep improving and offering the best service possible!",
  "hire_me": "Hire me!",
  "available_for_contract": "I am available for Contract Work:",
  "hire_skill_wordpress": "Advanced knowledge in WordPress & WooCommerce (over 10 years experience)",
  "hire_skill_react": "Proficient in React and React Native for modern web applications",
  "hire_skill_plugin": "Expertise in custom plugin and block development (eg: Gutenberg)",
  "hire_email_prompt": "Email <1>paul@wcpos.com</1> with your project.",
  "error_something_wrong": "Something went wrong: <1>{message}</1>"
}
```

- [ ] **Step 4: Create `src/lib/i18n.ts`**

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
  const { profile } = getLandingData();
  const locale = profile.locale || 'en_US';

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
            loadPath: `https://cdn.jsdelivr.net/gh/wcpos/translations@main/translations/js/{lng}/${PROJECT}/${NAMESPACE}.json`,
          },
        ],
      },
    });

  return i18next;
}
```

- [ ] **Step 5: Add `initI18n()` call to `src/index.tsx`**

Add the import with the other lib imports:

```typescript
import { initI18n } from './lib/i18n';
```

Add the call between `initAnalytics()` and `reportProfile()`:

```typescript
initAnalytics();
initI18n();
reportProfile();
```

- [ ] **Step 6: Verify build**

```bash
yarn build
```

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add i18n infrastructure with chained backend

Set up i18next with localStorage cache (7-day) + jsdelivr CDN
fallback + bundled English. Uses @main branch for latest
translations (not pinned to plugin version). Extract all
English strings to wp-admin-landing.json. Remove dead Transifex code."
```

---

## Task 7: Wrap all component strings with `t()`

**Files:**
- Modify: `src/components/hero.tsx`
- Modify: `src/components/pro.tsx`
- Modify: `src/components/paypal-button.tsx`
- Modify: `src/components/review.tsx`
- Modify: `src/components/hire-me.tsx`
- Modify: `src/components/error.tsx`

- [ ] **Step 1: Update `src/components/hero.tsx`**

Replace the full file:

```tsx
import { useTranslation } from 'react-i18next';
import { Badge } from './badge';

export const Hero = () => {
  const { t } = useTranslation();

  return (
    <div className="wcpos:space-y-2 wcpos:lg:space-y-4">
      <Badge>{t('support_the_project')}</Badge>
      <p className="wcpos:text-3xl wcpos:font-bold wcpos:lg:text-4xl">{t('hero_title')}</p>
      <p className="wcpos:max-w-[900px] wcpos:text-xl wcpos:leading-8">
        {t('hero_description')}
      </p>
      <p className="wcpos:max-w-[900px] wcpos:text-base">{t('ways_to_help')}</p>
      <ul className="wcpos:max-w-[900px] wcpos:text-base">
        <li>
          <span className="wcpos:text-2xl wcpos:mr-2">🚀</span>
          <strong>{t('upgrade_to_pro_label')}</strong><br />
          <span className="wcpos:text-gray-600">{t('upgrade_to_pro_description')}</span>
        </li>
        <li>
          <span className="wcpos:text-2xl wcpos:mr-2">💖</span>
          <strong>{t('donate_label')}</strong><br />
          <span className="wcpos:text-gray-600">{t('donate_description')}</span>
        </li>
        <li>
          <span className="wcpos:text-2xl wcpos:mr-2">✍️</span>
          <strong>{t('leave_review_label')}</strong><br />
          <span className="wcpos:text-gray-600">{t('leave_review_description')}</span>
        </li>
        <li>
          <span className="wcpos:text-2xl wcpos:mr-2">👩‍💻</span>
          <strong>{t('hire_me_label')}</strong><br />
          <span className="wcpos:text-gray-600">{t('hire_me_description')}</span>
        </li>
      </ul>
      <p className="wcpos:max-w-[900px] wcpos:text-base">{t('support_thanks')}</p>
    </div>
  );
};
```

- [ ] **Step 2: Update `src/components/pro.tsx`**

Replace the full file:

```tsx
import { useTranslation } from 'react-i18next';
import { trackEvent } from '../lib/analytics';
import { Button } from './button';

export const Pro = () => {
  const { t } = useTranslation();

  return (
    <div className="wcpos:bg-gray-50 wcpos:p-6 wcpos:rounded-lg">
      <h2 className="wcpos:text-2xl wcpos:font-semibold wcpos:m-0">{t('upgrade_to_pro')}</h2>
      <ul className="wcpos:list-disc wcpos:pl-6">
        <li>{t('use_any_wc_gateway')}</li>
        <li>{t('create_multiple_stores')}</li>
        <li>{t('analytics_for_sales')}</li>
        <li>{t('priority_discord_support')}</li>
      </ul>

      <Button
        href="https://wcpos.com/pro"
        target="_blank"
        onClick={() => trackEvent('upgrade_cta_clicked')}
      >
        {t('upgrade_to_pro')}
      </Button>
    </div>
  );
};
```

- [ ] **Step 3: Update `src/components/paypal-button.tsx`**

Add imports at the top:

```typescript
import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { trackEvent } from '../lib/analytics';
```

Remove the `import * as React from "react"` line.

Add the hook at the top of the component:

```typescript
const { t } = useTranslation();
```

Replace hardcoded strings:
- `"Donate"` heading → `{t('donate')}`
- `'Other'` in the button display → `t('other')`
- `"Enter donation amount"` placeholder → `t('enter_donation_amount')`
- `'Donation successful! Thank you for your generosity.'` in alert → `t('donation_successful')`

The donation option buttons display:
```tsx
{amount === 'Other' ? t('other') : `$${amount}`}
```

- [ ] **Step 4: Update `src/components/review.tsx`**

Replace the full file:

```tsx
import { useTranslation } from 'react-i18next';
import { trackEvent } from '../lib/analytics';
import { Button } from './button';

export const Review = () => {
  const { t } = useTranslation();
  const reviewPageUrl = 'https://wordpress.org/support/plugin/woocommerce-pos/reviews/#new-post';

  return (
    <div className="wcpos:bg-gray-50 wcpos:p-6 wcpos:rounded-lg wcpos:space-y-4">
      <h2 className="wcpos:text-2xl wcpos:font-semibold wcpos:m-0">{t('leave_a_review')}</h2>
      <p>{t('review_description')}</p>

      <Button
        href={reviewPageUrl}
        target="_blank"
        onClick={() => trackEvent('review_link_clicked')}
      >
        {t('leave_a_review')}
      </Button>
    </div>
  );
};
```

- [ ] **Step 5: Update `src/components/hire-me.tsx`**

Replace the full file:

```tsx
import { useTranslation, Trans } from 'react-i18next';
import { trackEvent } from '../lib/analytics';

export const HireMe = () => {
  const { t } = useTranslation();

  return (
    <div className="wcpos:bg-gray-50 wcpos:p-6 wcpos:rounded-lg">
      <h2 className="wcpos:text-2xl wcpos:font-semibold wcpos:m-0">{t('hire_me')}</h2>

      <p>{t('available_for_contract')}</p>

      <ul className="wcpos:list-disc wcpos:pl-6">
        <li>{t('hire_skill_wordpress')}</li>
        <li>{t('hire_skill_react')}</li>
        <li>{t('hire_skill_plugin')}</li>
      </ul>

      <Trans i18nKey="hire_email_prompt">
        Email{' '}
        <a
          href="mailto:paul@wcpos.com"
          onClick={() => trackEvent('hire_me_clicked')}
        >
          paul@wcpos.com
        </a>{' '}
        with your project.
      </Trans>
    </div>
  );
};
```

- [ ] **Step 6: Update `src/components/error.tsx`**

Replace the full file:

```tsx
import { Trans } from 'react-i18next';
import { FallbackProps } from 'react-error-boundary';

import Notice from './notice';

const ErrorFallback = ({ error, resetErrorBoundary }: FallbackProps) => {
  const message = error?.message ?? 'Unknown error';

  return (
    <div className="wcpos:p-4">
      <Notice status="error" onRemove={resetErrorBoundary}>
        <p>
          <Trans i18nKey="error_something_wrong" values={{ message }}>
            Something went wrong: <code>{message}</code>
          </Trans>
        </p>
      </Notice>
    </div>
  );
};

export default ErrorFallback;
```

This also removes the `lodash.get` dependency — uses optional chaining instead.

- [ ] **Step 7: Verify build**

```bash
yarn build
```

- [ ] **Step 8: Commit**

```bash
git add src/components/
git commit -m "feat: wrap all component strings with i18n t() calls

All hardcoded English text now goes through react-i18next.
Page renders identically using bundled English fallback.
Remove lodash dependency (replaced with optional chaining)."
```

---

## Task 8: Final cleanup

**Files:**
- Modify: `src/components/badge.tsx`
- Modify: `src/components/notice.tsx`
- Modify: `src/hooks/use-notices.tsx`

- [ ] **Step 1: Update `src/components/badge.tsx` — add types, remove React import**

Replace the full file:

```tsx
import { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
}

export const Badge = ({ children }: BadgeProps) => {
  return (
    <div className="wcpos:inline-block wcpos:rounded-lg wcpos:bg-gray-300 wcpos:px-3 wcpos:py-1 wcpos:text-sm">
      {children}
    </div>
  );
};
```

- [ ] **Step 2: Update `src/components/notice.tsx` — update React import**

Replace the full file:

```tsx
import { ReactNode } from 'react';
import classNames from 'classnames';

interface NoticeProps {
  status?: 'error' | 'info' | 'success';
  onRemove?: () => void;
  children: ReactNode;
  isDismissible?: boolean;
}

const Notice = ({ status, children, onRemove, isDismissible = true }: NoticeProps) => {
  return (
    <div
      className={classNames(
        'wcpos:flex wcpos:px-4 wcpos:py-2 wcpos:items-center',
        status === 'error' && 'wcpos:bg-red-300 wcpos:border-l-4 wcpos:border-red-600',
        status === 'info' && 'wcpos:bg-yellow-100 wcpos:border-l-4 wcpos:border-yellow-300',
        status === 'success' && 'wcpos:bg-green-100 wcpos:border-l-4 wcpos:border-green-600'
      )}
    >
      <div className="wcpos:flex-1">{children}</div>
    </div>
  );
};

export default Notice;
```

- [ ] **Step 3: Update `src/hooks/use-notices.tsx` — modernize React imports**

Replace the full file:

```tsx
import { createContext, useState, useContext, ReactNode } from 'react';

interface NoticeProps {
  type?: 'error' | 'info' | 'success';
  message: string;
}

interface NoticesContextProps {
  notice: NoticeProps | null;
  setNotice: (args: NoticeProps | null) => void;
}

const NoticesContext = createContext<NoticesContextProps>({
  notice: null,
  setNotice: () => {},
});

interface NoticesProviderProps {
  children: ReactNode;
}

export const NoticesProvider = ({ children }: NoticesProviderProps) => {
  const [notice, setNotice] = useState<NoticeProps | null>(null);

  return (
    <NoticesContext.Provider value={{ notice, setNotice }}>
      {children}
    </NoticesContext.Provider>
  );
};

const useNotices = () => {
  return useContext(NoticesContext);
};

export default useNotices;
```

- [ ] **Step 4: Run full TypeScript check**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 5: Run production build and verify output**

```bash
yarn build
ls -la assets/js/landing.js assets/css/landing.css
```

Both files should exist with non-zero sizes.

Verify React is not bundled (externals working):

```bash
grep -c "createElement" assets/js/landing.js
```

Expected: Very few or zero matches.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: final cleanup — modernize React imports, add TypeScript interfaces

Update import patterns for react-jsx tsconfig. Add proper
TypeScript interfaces to Badge, Notice, and Button components.
Remove all import * as React patterns."
```

---

## Summary of all commits

| Task | Commit message |
|---|---|
| 1 | `build: migrate from webpack to vite, upgrade tailwind v3 to v4` |
| 2 | `feat: add typed data layer for window.wcpos.landing` |
| 3 | `feat: replace Google Analytics with PostHog` |
| 4 | `feat: add fire-and-forget profile POST to updates-server` |
| 5 | `feat: add PostHog conversion event tracking to all CTAs` |
| 6 | `feat: add i18n infrastructure with chained backend` |
| 7 | `feat: wrap all component strings with i18n t() calls` |
| 8 | `chore: final cleanup — modernize React imports, add TypeScript interfaces` |
