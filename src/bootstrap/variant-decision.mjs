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
