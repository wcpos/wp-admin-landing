import posthog from 'posthog-js';
import ReactGA from 'react-ga4';
import { getLandingData } from './landing-data';

const POSTHOG_KEY = 'phc_BhTJzZ7fXMqcD4MiaUJQsQqPkEpu94yoSAthXFBWemvd';
const POSTHOG_HOST = 'https://ph.wcpos.com';
const GA_TRACKING_ID = 'G-08SJ28P1E5';

/**
 * Initializes Google Analytics and PostHog tracking.
 * GA and PostHog always fire an anonymous pageview. If the user has consented
 * (i.e. `profile` is present in landing data), PostHog is enriched via `identify`.
 */
export function initAnalytics(): void {
  // Google Analytics — always runs (same as before)
  ReactGA.initialize([{ trackingId: GA_TRACKING_ID }]);
  ReactGA.send({
    hitType: 'pageview',
    page: '/wp-admin/admin.php?page=woocommerce-pos',
    title: 'Support WooCommerce POS',
  });

  // PostHog — always runs (anonymous pageview)
  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    persistence: 'memory',
    autocapture: false,
    capture_pageview: false,
  });

  posthog.capture('$pageview');

  // If user consented to tracking, enrich with store profile
  const data = getLandingData();
  const profile = data?.profile;
  if (data && profile?.site_uuid) {
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
}

/**
 * Sends a custom event to PostHog.
 * @param event - The event name.
 * @param properties - Optional key-value properties attached to the event.
 */
export function trackEvent(event: string, properties?: Record<string, unknown>): void {
  posthog.capture(event, properties);
}
