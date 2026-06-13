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
 *  $feature_flag_called stays in lockstep with rendered events (spec §3.1.4).
 *  The onFeatureFlags subscription is unsubscribed at most once on flags-arrival
 *  (spec §5.1 — flag value never re-read post-identify). A synchronous-fire
 *  guard handles posthog-js firing the callback inline when flags are already
 *  persisted at subscription time. */
export function resolveFlag(ph: typeof posthog, timeoutMs = 500): Promise<{ flagValue: string | undefined; killSwitch: boolean; payload: unknown }> {
  return new Promise((resolve) => {
    let settled = false;
    const timer = setTimeout(() => { settled = true; resolve({ flagValue: undefined, killSwitch: false, payload: null }); }, timeoutMs);
    let unsub: (() => void) | undefined;
    let fired = false;
    unsub = ph.onFeatureFlags(() => {
      fired = true;
      const flagValue = ph.getFeatureFlag(FLAG_KEY) as string | undefined; // fires $feature_flag_called (spec §3.1.4)
      unsub?.(); // at-most-once: unsubscribe so post-identify reloads never re-enter
      if (settled) return; // post-timeout: exposure recorded, but never re-render (no mid-session switch)
      clearTimeout(timer);
      settled = true;
      const killValue = ph.getFeatureFlag(KILL_SWITCH_KEY, { send_event: false });
      resolve({
        flagValue,
        killSwitch: killValue === true || killValue === 'on',
        payload: ph.getFeatureFlagPayload(FLAG_KEY),
      });
    });
    // If the callback fired synchronously (flags already persisted), unsub is
    // defined now and needs an explicit call since unsub?.() inside the cb ran
    // before unsub was assigned.
    if (fired) unsub();
  });
}

export interface PreparedVariant { variant: string; renderSource: 'flag' | 'cache' | 'fallback'; assets: { js: string; css: string } }
export interface LoadedVariant { variant: string; renderSource: 'flag' | 'cache' | 'fallback' }

/** Decision phase only — no DOM side effects. The bootstrap exposes the runtime
 *  between prepare and inject: an injected script executes before its onload, so
 *  the runtime must exist before injection, not after (spec §3.1 ordering). */
export async function prepareVariant(ph: typeof posthog, anonId: string | undefined, proActive: boolean): Promise<PreparedVariant> {
  const { flagValue, killSwitch, payload } = await resolveFlag(ph);
  const decision = decideVariant({
    flagValue, cached: readCache(), anonId, schemaVersion: ANALYTICS_SCHEMA_VERSION,
    now: Date.now(), validVariants: VALID_VARIANTS, killSwitch, proActive, fallbackVariant: FALLBACK_VARIANT,
  });
  if (decision.cache) writeCache(decision.variant, anonId);
  const assets = resolveAssets(decision.variant, payload, VARIANT_ASSETS, ASSET_VERSION);
  return { variant: decision.variant, renderSource: decision.renderSource, assets };
}

export function injectAssets(assets: { js: string; css: string }): Promise<void> {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet'; link.href = assets.css;
    document.head.appendChild(link);
    const script = document.createElement('script');
    script.src = assets.js; script.async = true;
    const timer = setTimeout(() => reject(new Error(`variant chunk timeout: ${assets.js}`)), 10_000);
    script.onload = () => { clearTimeout(timer); resolve(); };
    script.onerror = () => { clearTimeout(timer); reject(new Error(`variant chunk failed: ${assets.js}`)); };
    document.head.appendChild(script);
  });
}

/** Compatibility composition: prepare → inject. */
export async function loadVariant(ph: typeof posthog, anonId: string | undefined, proActive: boolean): Promise<LoadedVariant> {
  const { variant, renderSource, assets } = await prepareVariant(ph, anonId, proActive);
  await injectAssets(assets);
  return { variant, renderSource };
}
