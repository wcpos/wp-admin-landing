import { getLandingData } from './landing-data';

export function reportProfile(): void {
  const data = getLandingData();
  if (!data?.profile || !data?.updates_server?.profile_url) return;

  fetch(data.updates_server.profile_url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data.profile),
  }).catch(() => {});
}
