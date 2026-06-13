// scripts/lint-translations.mjs — locale files must mirror the en sources exactly:
// same namespaces, same keys, same {placeholders} and <tag> markup, no emoji,
// no empty strings, valid JSON. Run as part of `npm run ci` (spec §9
// translation-completeness gate; translations are self-contained in this repo).
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import path from 'node:path';

const ROOT = new URL('../src/translations/', import.meta.url).pathname;
const NAMESPACES = [
  'wp-admin-landing-shared.json',
  'wp-admin-landing-indie.json',
  'wp-admin-landing-free-plus.json',
];
const PLACEHOLDER_RE = /\{[a-zA-Z0-9_]+\}/g;
const TAG_RE = /<\/?[a-zA-Z0-9]+>/g;
const EMOJI_RE = /\p{Extended_Pictographic}/u;

const sorted = (s) => [...s].sort().join(',');
const extract = (value, re) => sorted(value.match(re) ?? []);

const en = {};
for (const ns of NAMESPACES) {
  en[ns] = JSON.parse(readFileSync(path.join(ROOT, 'en', ns), 'utf8'));
}

const locales = readdirSync(ROOT).filter(
  (d) => d !== 'en' && statSync(path.join(ROOT, d)).isDirectory()
);

let failures = 0;
const fail = (msg) => { console.error(`lint-translations: ${msg}`); failures++; };

for (const locale of locales) {
  for (const ns of NAMESPACES) {
    const file = path.join(ROOT, locale, ns);
    if (!existsSync(file)) { fail(`${locale}/${ns} missing`); continue; }
    let strings;
    try {
      strings = JSON.parse(readFileSync(file, 'utf8'));
    } catch (err) {
      fail(`${locale}/${ns} invalid JSON: ${err.message}`);
      continue;
    }
    const enKeys = Object.keys(en[ns]);
    const locKeys = Object.keys(strings);
    for (const k of enKeys) if (!(k in strings)) fail(`${locale}/${ns} :: missing key '${k}'`);
    for (const k of locKeys) if (!(k in en[ns])) fail(`${locale}/${ns} :: extra key '${k}'`);
    for (const k of enKeys) {
      const enVal = en[ns][k];
      const locVal = strings[k];
      if (typeof locVal !== 'string' || locVal.trim() === '') {
        if (k in strings) fail(`${locale}/${ns} :: '${k}' empty or not a string`);
        continue;
      }
      if (extract(locVal, PLACEHOLDER_RE) !== extract(enVal, PLACEHOLDER_RE)) {
        fail(`${locale}/${ns} :: '${k}' placeholder mismatch (en: ${enVal.match(PLACEHOLDER_RE) ?? []} vs ${locVal.match(PLACEHOLDER_RE) ?? []})`);
      }
      if (extract(locVal, TAG_RE) !== extract(enVal, TAG_RE)) {
        fail(`${locale}/${ns} :: '${k}' markup-tag mismatch (en: ${enVal.match(TAG_RE) ?? []} vs ${locVal.match(TAG_RE) ?? []})`);
      }
      if (EMOJI_RE.test(locVal)) fail(`${locale}/${ns} :: '${k}' contains emoji`);
      if (enVal.includes('\n') !== locVal.includes('\n')) {
        fail(`${locale}/${ns} :: '${k}' newline mismatch`);
      }
    }
  }
}

if (failures) {
  console.error(`lint-translations: ${failures} problem(s) across ${locales.length} locales.`);
  process.exit(1);
}
console.log(`lint-translations: clean (${locales.length} locales × ${NAMESPACES.length} namespaces).`);
