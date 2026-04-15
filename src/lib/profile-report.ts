import { getLandingData } from './landing-data';

export function reportProfile(): void {
  const data = getLandingData();
  if (!data) return;

  const { updates_server, profile } = data;
  if (!updates_server?.profile_url) return;

  fetch(updates_server.profile_url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile),
  }).catch(() => {});
}
