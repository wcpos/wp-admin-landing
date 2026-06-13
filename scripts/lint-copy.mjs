// scripts/lint-copy.mjs
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const JUST_RE = /\bjust\b/i;
const BANNED = [
  /\bsimply\b/i, JUST_RE, /\bhurry\b/i, /\blimited time\b/i, /\bact now\b/i,
  /\brevolutionary\b/i, /\bgame.changing\b/i, /\bseamless\b/i, /\bleverage\b/i, /\bbest-in-class\b/i,
  /\p{Extended_Pictographic}/u, // emoji (spec: none in product copy)
];
/** Keys allowed to use "just" — locked copy approved by Paul (indie P.S., spec §2.1). Only the just-rule is skipped. */
const ALLOW_JUST = new Set(['ps']);
const YEAR_WORDS = '(?:eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty)';
const LITERAL_YEARS = new RegExp(`\\b(?:\\d{1,2}|${YEAR_WORDS})\\s+years?\\b`, 'i');

/** @param {Record<string,string>} strings @returns {{key:string,reason:string}[]} */
export function findViolations(strings) {
  const out = [];
  for (const [key, value] of Object.entries(strings)) {
    for (const re of BANNED) {
      if (re === JUST_RE && ALLOW_JUST.has(key)) continue;
      if (re.test(value)) { out.push({ key, reason: `banned pattern ${re}` }); break; }
    }
    if (LITERAL_YEARS.test(value) && !value.includes('{')) {
      out.push({ key, reason: 'literal year count — use a computed {placeholder} (spec §1)' });
    }
  }
  return out;
}

// CLI mode: lint the experiment namespaces only (legacy wp-admin-landing.json is excluded by design;
// scoping decision: we lint only the three new namespace files so CI enforces brand rules on new
// copy without retroactively blocking legacy strings we do not own in this PR).
const NAMESPACES = ['wp-admin-landing-shared.json', 'wp-admin-landing-indie.json', 'wp-admin-landing-free-plus.json'];
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const dir = new URL('../src/translations/en/', import.meta.url);
  const present = readdirSync(dir).filter((f) => NAMESPACES.includes(f));
  let failures = 0;
  for (const file of present) {
    const strings = JSON.parse(readFileSync(new URL(file, dir), 'utf8'));
    for (const v of findViolations(strings)) {
      console.error(`lint-copy: ${file} :: ${v.key} — ${v.reason}`);
      failures++;
    }
  }
  if (failures) process.exit(1);
  console.log(`lint-copy: clean (${present.length} namespaces).`);
}
