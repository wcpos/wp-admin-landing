/**
 * Two-tier data contract for window.wcpos.landing.
 *
 * Always available (no consent):
 *   schema_version, locale, plugin_version, pro_active
 *
 * With consent (profile + updates_server):
 *   Store metrics, UUIDs, updates-server config
 */

export interface ConsentProfile {
  wc_version: string;
  php_version: string;
  site_uuid: string;
  user_uuid: string;
  user_role: string;
  wc_currency: string;
  wc_country: string;
  days_since_install: number;
  product_count: number;
  order_count: number;
  pos_user_count: number;
  active_gateways: string[];
  active_extensions: string[];
}

export interface UpdatesServerConfig {
  profile_url: string;
}

export interface WCPOSLanding {
  schema_version: number;
  locale: string;
  plugin_version: string;
  pro_active: boolean;
  profile?: ConsentProfile;
  updates_server?: UpdatesServerConfig;
}

declare global {
  interface Window {
    wcpos?: {
      landing?: unknown;
    };
  }
}

function isValidBase(value: unknown): value is WCPOSLanding {
  if (!value || typeof value !== 'object') return false;

  const landing = value as WCPOSLanding;
  return (
    typeof landing.schema_version === 'number' &&
    typeof landing.locale === 'string' &&
    typeof landing.plugin_version === 'string' &&
    typeof landing.pro_active === 'boolean'
  );
}

export function getLandingData(): WCPOSLanding | undefined {
  const landing = window.wcpos?.landing;
  return isValidBase(landing) ? landing : undefined;
}
