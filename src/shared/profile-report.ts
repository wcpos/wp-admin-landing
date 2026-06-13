import { getLandingData } from './landing-data';

/**
 * POSTs the consented store profile to the updates-server.
 * No-op when `profile` or `updates_server.profile_url` is missing from landing data.
 */
export function reportProfile(): void {
  const data = getLandingData();
  if (!data?.profile || !data?.updates_server?.profile_url) return;

  fetch(data.updates_server.profile_url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...data.profile,
      locale: data.locale,
      plugin_version: data.plugin_version,
      pro_active: data.pro_active,
    }),
  }).catch(() => {});
}
