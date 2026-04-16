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

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function isConsentProfile(value: unknown): value is ConsentProfile {
  if (!value || typeof value !== 'object') return false;

  const p = value as ConsentProfile;
  return (
    typeof p.wc_version === 'string' &&
    typeof p.php_version === 'string' &&
    typeof p.site_uuid === 'string' &&
    typeof p.user_uuid === 'string' &&
    typeof p.user_role === 'string' &&
    typeof p.wc_currency === 'string' &&
    typeof p.wc_country === 'string' &&
    typeof p.days_since_install === 'number' &&
    typeof p.product_count === 'number' &&
    typeof p.order_count === 'number' &&
    typeof p.pos_user_count === 'number' &&
    isStringArray(p.active_gateways) &&
    isStringArray(p.active_extensions)
  );
}

function isUpdatesServerConfig(value: unknown): value is UpdatesServerConfig {
  if (!value || typeof value !== 'object') return false;

  const u = value as UpdatesServerConfig;
  return typeof u.profile_url === 'string';
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
  if (!isValidBase(landing)) return undefined;

  // Strip optional blocks that don't match their expected shape
  const validated: WCPOSLanding = { ...landing };
  if (validated.profile !== undefined && !isConsentProfile(validated.profile)) {
    delete validated.profile;
  }
  if (validated.updates_server !== undefined && !isUpdatesServerConfig(validated.updates_server)) {
    delete validated.updates_server;
  }

  return validated;
}
