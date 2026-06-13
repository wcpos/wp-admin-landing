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
      // Amendment: skeleton is cleared HERE, before injection, not inside
      // signalRendered. The variant mounts into #woocommerce-pos-upgrade (same
      // element), so calling clearSkeleton() after React renders would wipe the
      // just-mounted tree. Clearing before injection empties the placeholder
      // div, giving React a clean container to mount into. signalRendered only
      // fires the tracking event.
      signalRendered: () => {
        trackEvent('landing_variant_rendered', {
          variant,
          render_source: renderSource,
          time_to_render_ms: Math.round(performance.now() - t0),
          asset_version: constants.ASSET_VERSION,
        });
      },
    });

    // Clear skeleton BEFORE injecting the variant chunk. The injected script
    // executes synchronously before its onload, so it finds el already empty
    // and ready for React to mount into. If we cleared inside signalRendered
    // (called after mount), el.innerHTML='' would destroy the React tree.
    clearSkeleton(el);
    await injectAssets(assets);
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
