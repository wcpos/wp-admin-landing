// scripts/lint-tailwind-prefix.mjs — Tailwind v4 with prefix(wcpos) requires the
// prefix FIRST, then variants: `wcpos:lg:grid-cols-2`, NOT `lg:wcpos:grid-cols-2`.
// The wrong order silently generates no CSS (no build error) → broken responsive
// layout. This guards against that exact regression. Runs in `npm run ci`.
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const VARIANTS =
  '(?:sm|md|lg|xl|2xl|hover|focus|active|disabled|first|last|odd|even|group-hover|group-focus|focus-within|focus-visible|motion-safe|motion-reduce|dark|rtl|ltr)';
const WRONG_ORDER = new RegExp(`\\b${VARIANTS}:wcpos:`, 'g');

function sourceFiles(dir) {
  return readdirSync(dir, { recursive: true })
    .map((f) => String(f))
    .filter((f) => f.endsWith('.tsx') || f.endsWith('.ts'))
    .map((f) => path.join(dir, f));
}

let failures = 0;
for (const file of sourceFiles('src')) {
  const src = readFileSync(file, 'utf8');
  src.split('\n').forEach((line, i) => {
    const m = line.match(WRONG_ORDER);
    if (m) {
      for (const hit of m) {
        const fixed = hit.replace(new RegExp(`(${VARIANTS}):wcpos:`), 'wcpos:$1:');
        console.error(`lint-tailwind-prefix: ${file}:${i + 1} — '${hit}' must be '${fixed}' (Tailwind v4: prefix before variant)`);
        failures++;
      }
    }
  });
}

if (failures) {
  console.error(`lint-tailwind-prefix: ${failures} mis-ordered class(es) — they generate NO CSS.`);
  process.exit(1);
}
console.log('lint-tailwind-prefix: clean.');
