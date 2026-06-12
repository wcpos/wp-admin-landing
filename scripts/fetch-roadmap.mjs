// scripts/fetch-roadmap.mjs
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

const OUT = new URL('../src/shared/roadmap.json', import.meta.url);
const CURATION = JSON.parse(readFileSync(new URL('./roadmap-curation.json', import.meta.url), 'utf8'));

let board;
try {
  const raw = execFileSync('gh', ['project', 'item-list', '4', '--owner', 'wcpos', '--format', 'json', '--limit', '100'], { encoding: 'utf8' });
  board = JSON.parse(raw).items ?? [];
} catch (err) {
  console.warn(`fetch-roadmap: gh failed (${err.message}); keeping committed snapshot (fail-closed).`);
  process.exit(0);
}

const titles = new Set(board.map((it) => it.title));
for (const entry of [...CURATION.next, ...CURATION.done]) {
  if (entry.board_title && !titles.has(entry.board_title)) {
    console.warn(`fetch-roadmap: curated item not on board: "${entry.board_title}"`);
  }
  if (entry.board_title === null) {
    console.warn(`fetch-roadmap: "${entry.display}" has no board issue yet — create one to keep the card verifiable.`);
  }
}

writeFileSync(OUT, JSON.stringify({
  generated_at: new Date().toISOString().slice(0, 10),
  done: CURATION.done.map((e) => e.display).slice(0, CURATION.done_limit),
  next: CURATION.next.map((e) => e.display),
}, null, 2) + '\n');
console.log('fetch-roadmap: snapshot refreshed.');
