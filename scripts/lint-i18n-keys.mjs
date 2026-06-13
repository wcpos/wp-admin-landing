// scripts/lint-i18n-keys.mjs — every t('key') used in a variant exists in its en namespace
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import path from 'node:path';

const NS_FOR_DIR = {
  'src/variants/indie': 'wp-admin-landing-indie.json',
  'src/variants/free-plus': 'wp-admin-landing-free-plus.json',
  'src/shared/components': 'wp-admin-landing-shared.json',
};

function tsxFiles(dir) {
  return readdirSync(dir, { recursive: true })
    .filter((f) => String(f).endsWith('.tsx') || String(f).endsWith('.ts'))
    .map((f) => path.join(dir, String(f)));
}

let failures = 0;
for (const [dir, nsFile] of Object.entries(NS_FOR_DIR)) {
  if (!existsSync(dir) || !existsSync(`src/translations/en/${nsFile}`)) continue;
  const keys = new Set(Object.keys(JSON.parse(readFileSync(`src/translations/en/${nsFile}`, 'utf8'))));
  // shared keys are reachable from every component
  const shared = new Set(Object.keys(JSON.parse(readFileSync('src/translations/en/wp-admin-landing-shared.json', 'utf8'))));
  for (const file of tsxFiles(dir)) {
    const src = readFileSync(file, 'utf8');
    for (const m of src.matchAll(/\bt\(\s*'([^']+)'/g)) {
      if (!keys.has(m[1]) && !shared.has(m[1])) {
        console.error(`lint-i18n-keys: ${file} uses missing key '${m[1]}' (expected in ${nsFile})`);
        failures++;
      }
    }
  }
}
if (failures) process.exit(1);
console.log('lint-i18n-keys: clean.');
