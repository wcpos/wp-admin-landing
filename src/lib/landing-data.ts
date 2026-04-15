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
  api_host: string;
  api_key: string;
}

export interface UpdatesServerConfig {
  profile_url: string;
}

export interface WCPOSLanding {
  schema_version: number;
  profile: LandingProfile;
  posthog: PostHogConfig;
  updates_server: UpdatesServerConfig;
}

declare global {
  interface Window {
    wcpos: {
      landing: WCPOSLanding;
    };
  }
}

export function getLandingData(): WCPOSLanding {
  return window.wcpos.landing;
}
