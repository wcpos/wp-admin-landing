// tests/plan-variant.test.mjs — the plan variant keeps the variant runtime
// contract (source-level, like the other contract tests: no DOM renderer here).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (f) => readFileSync(new URL(`../src/variants/plan/${f}`, import.meta.url), 'utf8');
const index = read('index.tsx');
const buy = read('buy.tsx');
const plans = read('plans.tsx');
const loader = readFileSync(new URL('../src/bootstrap/variant-loader.ts', import.meta.url), 'utf8');

test('plan is registered with its own chunk and is a served variant and the fallback', () => {
  assert.match(loader, /VALID_VARIANTS = \[[^\]]*'plan'/);
  assert.match(loader, /plan: \{ js: `\$\{ASSET_BASE\}\/js\/variants\/plan\.js`, css: `\$\{ASSET_BASE\}\/css\/variants\/plan\.css` \}/);
  assert.match(loader, /FALLBACK_VARIANT = 'plan'/);
  assert.match(loader, /SERVED_VARIANTS = \['plan', 'jobs'\]/);
  assert.equal((loader.match(/validVariants: servedVariants\(\)/g) || []).length, 2);
});

test('renders through readRuntime and signals rendered exactly once', () => {
  assert.match(index, /readRuntime\(\)/);
  assert.equal(index.match(/signalRendered\(\)/g)?.length, 1);
});

test('CTA clicks use the shared event with plan locations and the decorated URL', () => {
  assert.match(buy, /trackEvent\('upgrade_cta_clicked', \{ cta_location: location, href \}\)/);
  assert.match(buy, /decorateOutboundUrl\(PRO_URL, rt\.variant\)/, 'utm_content comes from the runtime variant (plan)');
  assert.match(plans, /<Buy location="plan_card" \/>/);
  assert.match(index, /<Buy location="plan_closing" \/>/);
});

test('pro_active swaps the button for the shared thanks line and drops the closing block', () => {
  assert.match(index, /getLandingData\(\)\?\.pro_active/);
  assert.match(index, /\{!proActive && \(\s*<section className="plan-closing"/);
  assert.match(plans, /proActive \? \([\s\S]*?pro_active_thanks[\s\S]*?\) : \(\s*<Buy location="plan_card" \/>/);
  assert.match(plans, /'headline_pro'/);
});
