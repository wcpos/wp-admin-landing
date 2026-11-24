// tests/jobs-variant.test.mjs — the jobs variant keeps the variant runtime
// contract and ships dark (source-level, like the other contract tests).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';

const read = (f) => readFileSync(new URL(`../src/variants/jobs/${f}`, import.meta.url), 'utf8');
const index = read('index.tsx');
const side = read('side.tsx');
const rows = read('rows.tsx');
const css = read('jobs.css').replace(/\/\*[\s\S]*?\*\//g, ''); // rules only, comments stripped
const loader = readFileSync(new URL('../src/bootstrap/variant-loader.ts', import.meta.url), 'utf8');

test('jobs is registered with its own chunk', () => {
  assert.match(loader, /VALID_VARIANTS = \[[^\]]*'jobs'/);
  assert.match(loader, /jobs: \{ js: `\$\{ASSET_BASE\}\/js\/variants\/jobs\.js`, css: `\$\{ASSET_BASE\}\/css\/variants\/jobs\.css` \}/);
});

test('jobs ships dark: not served, not the fallback, reachable only in preview', () => {
  const served = loader.match(/SERVED_VARIANTS = \[([^\]]*)\]/)[1];
  assert.doesNotMatch(served, /'jobs'/);
  assert.doesNotMatch(loader, /FALLBACK_VARIANT = 'jobs'/);
  assert.match(loader, /__WCPOS_PREVIEW \? VALID_VARIANTS : SERVED_VARIANTS/);
});

test('renders through readRuntime and signals rendered exactly once', () => {
  assert.match(index, /readRuntime\(\)/);
  assert.equal(index.match(/signalRendered\(\)/g)?.length, 1);
});

test('CTA clicks use the shared event with jobs locations and the decorated URL', () => {
  assert.match(side, /trackEvent\('upgrade_cta_clicked', \{ cta_location: location, href \}\)/);
  assert.match(side, /decorateOutboundUrl\(PRO_URL, rt\.variant\)/, 'utm_content comes from the runtime variant (jobs)');
  assert.match(index, /<Buy location="jobs_card" proActive=\{proActive\} \/>/);
  assert.match(index, /\{!proActive && <Buy location="jobs_closing" \/>\}/);
});

test('pro_active swaps prices and button for the shared thanks line, rows become statements', () => {
  assert.match(index, /getLandingData\(\)\?\.pro_active/);
  assert.match(side, /proActive \? \(\s*<p className="jobs-thanks">\{ts\('pro_active_thanks'\)\}<\/p>/);
  assert.match(rows, /t\(`\$\{key\}\$\{p\}_q`\)/);
  assert.match(index, /`headline\$\{p\}`/);
});

test('rows are native <details> (refunds open), the card-reader row has no disclosure', () => {
  assert.match(rows, /<details key=\{key\} className="jobs-q" open=\{open\}>/);
  assert.match(rows, /key: 'refund', open: true/);
  assert.match(rows, /\{ key: 'cards' \}/);
  assert.doesNotMatch(rows + index + side, /useState|onToggle/);
});

test('the right column is not sticky and every rule is scoped', () => {
  assert.doesNotMatch(css, /position:\s*sticky/);
  assert.match(css, /^#woocommerce-pos-upgrade \{/m);
  for (const cls of css.matchAll(/\.([a-z][\w-]*)/g)) assert.match(cls[1], /^jobs-/, `unprefixed class .${cls[1]}`);
});

test('every crop file exists as png and webp', () => {
  for (const [, file] of rows.matchAll(/file: '([\w-]+)'/g)) {
    for (const ext of ['png', 'webp']) assert.ok(existsSync(new URL(`../assets/img/${file}.${ext}`, import.meta.url)), `${file}.${ext}`);
  }
});

test('the namespace exists in every locale with the same keys', () => {
  const root = new URL('../src/translations/', import.meta.url);
  const keys = Object.keys(JSON.parse(readFileSync(new URL('en/wp-admin-landing-jobs.json', root), 'utf8'))).sort();
  const locales = readdirSync(root, { withFileTypes: true }).filter((d) => d.isDirectory());
  assert.equal(locales.length, 31);
  for (const d of locales) {
    const loc = JSON.parse(readFileSync(new URL(`${d.name}/wp-admin-landing-jobs.json`, root), 'utf8'));
    assert.deepEqual(Object.keys(loc).sort(), keys, d.name);
  }
});
