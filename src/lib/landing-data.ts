/**
 * Two-tier data contract for window.wcpos.landing.
 *
 * Always available (no consent):
 *   schema_version, locale, plugin_version, pro_active
 *
 * With consent (profile + updates_server):
 *   Store metrics, UUIDs, updates-server config
 */

/** Store metrics and identifiers available only when the user has opted in to tracking. */
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

/** Configuration for the updates-server endpoint used to report store profiles. */
export interface UpdatesServerConfig {
  profile_url: string;
}

/** Two-tier landing data injected via `window.wcpos.landing`. Base fields are always present; `profile` and `updates_server` are consent-gated. */
export interface WCPOSLanding {
  schema_version: number;
  locale: string;
  plugin_version: string;
  pro_active: boolean;
  profile?: ConsentProfile;
  updates_server?: UpdatesServerConfig;
}

type LandingBase = Pick<
  WCPOSLanding,
  'schema_version' | 'locale' | 'plugin_version' | 'pro_active'
>;

declare global {
  interface Window {
    wcpos?: {
      landing?: unknown;
    };
  }
}

/** Type guard that checks whether a value is an array of strings. */
function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

/** Type guard validating that a value conforms to the {@link ConsentProfile} shape. */
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

/** Type guard validating that a value conforms to the {@link UpdatesServerConfig} shape. */
function isUpdatesServerConfig(value: unknown): value is UpdatesServerConfig {
  if (!value || typeof value !== 'object') return false;

  const u = value as UpdatesServerConfig;
  return typeof u.profile_url === 'string';
}

/** Type guard validating that a value has the required base fields of {@link WCPOSLanding}. */
function isValidBase(value: unknown): value is LandingBase {
  if (!value || typeof value !== 'object') return false;

  const landing = value as LandingBase;
  return (
    typeof landing.schema_version === 'number' &&
    typeof landing.locale === 'string' &&
    typeof landing.plugin_version === 'string' &&
    typeof landing.pro_active === 'boolean'
  );
}

/**
 * Reads and validates `window.wcpos.landing`, returning a typed {@link WCPOSLanding} object.
 * Consent-tier fields (`profile`, `updates_server`) are included only when both are valid.
 * @returns The validated landing data, or `undefined` if base fields are missing or invalid.
 */
export function getLandingData(): WCPOSLanding | undefined {
  const landing = window.wcpos?.landing;
  if (!isValidBase(landing)) return undefined;

  // Consent tier: profile and updates_server are coupled — include both only if both are valid
  const validated: WCPOSLanding = {
    schema_version: landing.schema_version,
    locale: landing.locale,
    plugin_version: landing.plugin_version,
    pro_active: landing.pro_active,
  };

  const raw = landing as Partial<WCPOSLanding>;
  if (isConsentProfile(raw.profile) && isUpdatesServerConfig(raw.updates_server)) {
    validated.profile = raw.profile;
    validated.updates_server = raw.updates_server;
  }

  return validated;
}
