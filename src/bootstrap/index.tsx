import { initAnalytics, identifyConsented, trackEvent, decorateOutboundUrl } from '../shared/analytics';
import { initI18n } from '../shared/i18n';
import { getLandingData } from '../shared/landing-data';
import { reportProfile } from '../shared/profile-report';
import { exposeRuntime } from '../shared/runtime';
import * as constants from '../shared/constants';
import { prepareVariant, injectAssets } from './variant-loader';
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
    const { variant, renderSource, assets } = await prepareVariant(ph, data?.anon_id, data?.pro_active ?? false);

    // Flag-before-identify (§5.1): variant is final → pin it, then merge identity.
    ph.register({ landing_variant: variant });
    identifyConsented();

    // Expose before injection: the variant chunk executes (and reads the runtime)
    // before its onload fires, so the runtime must already exist (§3.1 amendment).
    exposeRuntime({
      posthog: ph,
      i18next: i18n,
      trackEvent,
      decorateOutboundUrl,
      getLandingData,
      constants,
      variant,
      renderSource,
      // signalRendered only fires the tracking event. The skeleton is NOT
      // cleared here or before injection: the variant's createRoot(el).render()
      // replaces the container's children when it mounts, so the branded
      // skeleton stays visible right up until the real content appears — no
      // blank flash between placeholder and page (perceived-performance).
      signalRendered: () => {
        trackEvent('landing_variant_rendered', {
          variant,
          render_source: renderSource,
          time_to_render_ms: Math.round(performance.now() - t0),
          asset_version: constants.ASSET_VERSION,
        });
      },
    });

    // Keep the skeleton up while the chunk loads — React replaces it on mount.
    await injectAssets(assets);
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
