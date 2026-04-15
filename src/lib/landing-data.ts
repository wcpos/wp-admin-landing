export interface LandingProfile {
  locale: string;
  wc_version: string;
  plugin_version: string;
  days_since_install: number;
  product_count: number;
  order_count: number;
  pos_user_count: number;
  active_gateways: string[];
  pro_active: boolean;
  active_extensions: string[];
  php_version: string;
  site_uuid: string;
  user_uuid: string;
  user_role: string;
  wc_currency: string;
  wc_country: string;
}

export interface PostHogConfig {
  api_host?: string;
  api_key?: string;
}

export interface UpdatesServerConfig {
  profile_url?: string;
}

export interface WCPOSLanding {
  schema_version: number;
  profile: LandingProfile;
  posthog?: PostHogConfig;
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

function isLandingProfile(value: unknown): value is LandingProfile {
  if (!value || typeof value !== 'object') return false;

  const profile = value as LandingProfile;
  return (
    typeof profile.locale === 'string' &&
    typeof profile.wc_version === 'string' &&
    typeof profile.plugin_version === 'string' &&
    typeof profile.days_since_install === 'number' &&
    typeof profile.product_count === 'number' &&
    typeof profile.order_count === 'number' &&
    typeof profile.pos_user_count === 'number' &&
    isStringArray(profile.active_gateways) &&
    typeof profile.pro_active === 'boolean' &&
    isStringArray(profile.active_extensions) &&
    typeof profile.php_version === 'string' &&
    typeof profile.site_uuid === 'string' &&
    typeof profile.user_uuid === 'string' &&
    typeof profile.user_role === 'string' &&
    typeof profile.wc_currency === 'string' &&
    typeof profile.wc_country === 'string'
  );
}

function isPostHogConfig(value: unknown): value is PostHogConfig {
  if (!value || typeof value !== 'object') return false;

  const posthog = value as PostHogConfig;
  return (
    (posthog.api_host === undefined || typeof posthog.api_host === 'string') &&
    (posthog.api_key === undefined || typeof posthog.api_key === 'string')
  );
}

function isUpdatesServerConfig(value: unknown): value is UpdatesServerConfig {
  if (!value || typeof value !== 'object') return false;

  const updatesServer = value as UpdatesServerConfig;
  return updatesServer.profile_url === undefined || typeof updatesServer.profile_url === 'string';
}

export function isLandingData(value: unknown): value is WCPOSLanding {
  if (!value || typeof value !== 'object') return false;

  const landing = value as WCPOSLanding;
  return (
    typeof landing.schema_version === 'number' &&
    isLandingProfile(landing.profile) &&
    (landing.posthog === undefined || isPostHogConfig(landing.posthog)) &&
    (landing.updates_server === undefined || isUpdatesServerConfig(landing.updates_server))
  );
}

export function getLandingData(): WCPOSLanding | undefined {
  const landing = window.wcpos?.landing;
  return isLandingData(landing) ? landing : undefined;
}
