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

export function exposeRuntime(rt: LandingRuntime): void {
  const w = window as { wcpos?: { landingRuntime?: unknown } };
  w.wcpos = w.wcpos ?? {};
  w.wcpos.landingRuntime = rt;
}

export function readRuntime(): LandingRuntime {
  const rt = (window as { wcpos?: { landingRuntime?: unknown } }).wcpos?.landingRuntime;
  if (!rt) throw new Error('wcpos.landingRuntime missing — variant loaded without bootstrap');
  return rt as LandingRuntime;
}
