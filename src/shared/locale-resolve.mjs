// src/shared/locale-resolve.mjs
// Pure locale→directory resolution for the i18n HTTP backend. Kept as a plain
// .mjs (no DOM/i18next imports) so node --test can exercise the mapping.

/** Translation directories that exist in src/translations/ (keep in sync; the
 *  lint-translations CI gate validates each has the full namespace set). */
export const LOCALE_DIRS = [
  'ar', 'cs_CZ', 'da_DK', 'de_DE', 'el', 'en', 'es_ES', 'es_MX', 'fi', 'fr_FR',
  'he_IL', 'hi_IN', 'hu_HU', 'id_ID', 'it_IT', 'ja', 'ko_KR', 'nb_NO', 'nl_NL',
  'pl_PL', 'pt_BR', 'pt_PT', 'ro_RO', 'ru_RU', 'sv_SE', 'th', 'tr_TR', 'uk', 'vi',
  'zh_CN', 'zh_TW',
];

/**
 * Maps an i18next-requested language code to an available translation directory.
 * Files use full WP locale codes (fr_FR, es_ES, …). This resolves:
 *  - exact region matches, including hyphenated BCP-47 forms i18next/browsers
 *    may pass (zh-TW → zh_TW, es-MX → es_MX, pt-PT → pt_PT), case-insensitively;
 *  - short codes from sites whose WP locale is language-only (es → es_ES,
 *    pt → pt_BR, zh → zh_CN) so those users get their language, not English.
 * Unknown codes pass through unchanged → the file 404s → bundled-English
 * fallback (the documented behaviour for unsupported locales).
 *
 * @param {string} lng
 * @returns {string}
 */
export function resolveLocaleDir(lng) {
  if (!lng) return lng;
  const norm = lng.replace(/-/g, '_'); // BCP-47 hyphen → WP underscore (zh-TW → zh_TW)
  // Exact region/language match first, so es-MX stays es_MX and never collapses
  // to the base language's first region (es_ES). Case-insensitive to tolerate
  // codes like `zh_tw` from cleanCode/lowercasing.
  const exact = LOCALE_DIRS.find((dir) => dir.toLowerCase() === norm.toLowerCase());
  if (exact) return exact;
  const base = norm.split('_')[0].toLowerCase();
  if (LOCALE_DIRS.includes(base)) return base; // language-only dir (ja, ar, en, …)
  return LOCALE_DIRS.find((dir) => dir.toLowerCase().split('_')[0] === base) ?? lng;
}
