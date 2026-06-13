// scripts/lint-snapshots.mjs — snapshots must be < 90 days old (spec §8)
import { readFileSync } from 'node:fs';
const MAX_AGE_DAYS = 90;
let failures = 0;
for (const file of ['src/shared/wporg-reviews.json', 'src/shared/roadmap.json']) {
  const { generated_at } = JSON.parse(readFileSync(file, 'utf8'));
  const age = (Date.now() - new Date(generated_at).getTime()) / 86_400_000;
  if (!(age <= MAX_AGE_DAYS)) {
    console.error(`lint-snapshots: ${file} is ${Math.floor(age)} days old (max ${MAX_AGE_DAYS}) — run the fetch scripts`);
    failures++;
  }
}
if (failures) process.exit(1);
console.log('lint-snapshots: clean.');
