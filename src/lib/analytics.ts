import posthog from 'posthog-js';
import { getLandingData } from './landing-data';

export function initAnalytics(): void {
  const data = getLandingData();
  if (!data?.posthog?.api_key || !data?.posthog?.api_host || !data?.profile?.site_uuid) return;

  const config = data.posthog;
  const profile = data.profile;

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
