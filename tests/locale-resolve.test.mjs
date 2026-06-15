// tests/locale-resolve.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveLocaleDir, LOCALE_DIRS } from '../src/shared/locale-resolve.mjs';

test('exact full-locale matches pass through', () => {
  assert.equal(resolveLocaleDir('es_ES'), 'es_ES');
  assert.equal(resolveLocaleDir('fr_FR'), 'fr_FR');
  assert.equal(resolveLocaleDir('zh_TW'), 'zh_TW');
  assert.equal(resolveLocaleDir('ja'), 'ja'); // language-only dir
});

test('short codes map to a region directory (so they are not served English)', () => {
  assert.equal(resolveLocaleDir('es'), 'es_ES');
  assert.equal(resolveLocaleDir('fr'), 'fr_FR');
  assert.equal(resolveLocaleDir('de'), 'de_DE');
  assert.equal(resolveLocaleDir('pt'), 'pt_BR'); // first region variant in the list
  assert.equal(resolveLocaleDir('zh'), 'zh_CN');
});

test('hyphenated and base codes resolve too', () => {
  assert.equal(resolveLocaleDir('fr-FR'), 'fr_FR'); // i18next/browser hyphen form
  assert.equal(resolveLocaleDir('en_US'), 'en');    // base en dir exists (bundled source)
});

test('region variants keep their own directory', () => {
  assert.equal(resolveLocaleDir('es_MX'), 'es_MX');
  assert.equal(resolveLocaleDir('pt_PT'), 'pt_PT');
});

test('hyphenated codes keep their exact region (not the base language first region)', () => {
  // Regression (Codex #31): 'zh-TW' must not collapse to zh_CN, 'es-MX' to es_ES.
  assert.equal(resolveLocaleDir('zh-TW'), 'zh_TW');
  assert.equal(resolveLocaleDir('es-MX'), 'es_MX');
  assert.equal(resolveLocaleDir('pt-PT'), 'pt_PT');
  assert.equal(resolveLocaleDir('zh_tw'), 'zh_TW'); // case-insensitive
});

test('unknown locales pass through unchanged → 404 → English fallback', () => {
  assert.equal(resolveLocaleDir('xx_XX'), 'xx_XX');
  assert.equal(resolveLocaleDir('zz'), 'zz');
});

test('LOCALE_DIRS has no short duplicates that would shadow region codes', () => {
  // 'es' must not be a dir (only es_ES/es_MX), else short→region mapping breaks.
  assert.ok(!LOCALE_DIRS.includes('es'));
  assert.ok(!LOCALE_DIRS.includes('fr'));
});
