// scripts/fetch-wporg-reviews.mjs
import { readFileSync, writeFileSync } from 'node:fs';

const PATH = new URL('../src/shared/wporg-reviews.json', import.meta.url);
const snapshot = JSON.parse(readFileSync(PATH, 'utf8'));

for (const review of snapshot.reviews) {
  try {
    const res = await fetch(review.url, { headers: { 'user-agent': 'wcpos-build/1.0' } });
    if (!res.ok) { console.warn(`fetch-wporg-reviews: ${review.url} → HTTP ${res.status}; keeping snapshot entry.`); continue; }
    const html = await res.text();
    // First author avatar in the topic: <img alt='' src='https://secure.gravatar.com/avatar/…' …>
    const m = html.match(/<img[^>]+src='(https:\/\/secure\.gravatar\.com\/avatar\/[^']+)'/);
    if (m) review.avatar = m[1];
  } catch (err) {
    console.warn(`fetch-wporg-reviews: ${review.url} failed (${err.message}); keeping snapshot (fail-closed).`);
  }
}

snapshot.generated_at = new Date().toISOString().slice(0, 10);
writeFileSync(PATH, JSON.stringify(snapshot, null, 2) + '\n');
console.log('fetch-wporg-reviews: snapshot refreshed.');
