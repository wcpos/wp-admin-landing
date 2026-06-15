import posthog from 'posthog-js';
import { getLandingData } from './landing-data';
import { ANALYTICS_SCHEMA_VERSION } from './constants';

const POSTHOG_KEY = 'phc_BhTJzZ7fXMqcD4MiaUJQsQqPkEpu94yoSAthXFBWemvd';
const POSTHOG_HOST = 'https://ph.wcpos.com';
const VISIT_KEY = 'wcpos_landing_visits';
const VISIT_SESSION_KEY = 'wcpos_landing_visit_counted';
const PRO_OBSERVED_KEY = 'wcpos_pro_observed';

interface VisitState {
  visit_count: number;
  first_seen_at: string;
}

/**
 * Per-browser visit counter + first-seen, persisted beside the assignment cache.
 * visit_count is incremented once per session (sessionStorage-guarded), spec §5.1.
 */
function bumpVisitState(): VisitState {
  try {
    if (window.sessionStorage.getItem(VISIT_SESSION_KEY)) {
      const raw = window.localStorage.getItem(VISIT_KEY);
      if (raw) return JSON.parse(raw) as VisitState;
    }
    const raw = window.localStorage.getItem(VISIT_KEY);
    const prev = raw ? (JSON.parse(raw) as VisitState) : null;
    const next: VisitState = {
      visit_count: (prev?.visit_count ?? 0) + 1,
      first_seen_at: prev?.first_seen_at ?? new Date().toISOString(),
    };
    window.localStorage.setItem(VISIT_KEY, JSON.stringify(next));
    window.sessionStorage.setItem(VISIT_SESSION_KEY, '1');
    return next;
  } catch {
    return { visit_count: 1, first_seen_at: new Date().toISOString() };
  }
}

/**
 * True when posthog-js already has a persisted identity in this browser.
 * Note: posthog-js sanitizes tokens containing +, =, or / when building its
 * `ph_<token>_posthog` key; the current key contains none of those characters,
 * so plain interpolation matches. Revisit if the project key ever rotates.
 */
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
/** True on the GitHub Pages preview harness — keeps preview pageloads out of
 *  production PostHog so they never pollute baselines (set by the harness). */
function isPreview(): boolean {
  try {
    return typeof window !== 'undefined' && (window as unknown as { __WCPOS_PREVIEW?: boolean }).__WCPOS_PREVIEW === true;
  } catch {
    return false;
  }
}

export function initAnalytics(): typeof posthog {
  const data = getLandingData();
  const anonId = data?.anon_id;
  const preview = isPreview();

  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    persistence: 'localStorage',
    person_profiles: 'always',
    autocapture: false,
    capture_pageview: false,
    disable_session_recording: true,
    // Trim PostHog features the landing page never uses — each otherwise
    // lazy-loads its own script (surveys.js, web-vitals.js, dead-clicks) and
    // adds requests/main-thread work during the first render.
    disable_surveys: true,
    capture_performance: false,
    capture_heatmaps: false,
    capture_dead_clicks: false,
    opt_out_capturing_by_default: preview,
    // Preview (GitHub Pages harness): never resolve production feature flags.
    // The harness seeds its own assignment cache to render a chosen variant; a
    // live `landing-variant` flag must not win over that, and preview iframe
    // loads should not hit the production flag endpoint at all.
    advanced_disable_flags: preview,
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

  if (!preview) {
    posthog.capture('$pageview');
    observeProActivation(data?.pro_active ?? false);
  }
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
