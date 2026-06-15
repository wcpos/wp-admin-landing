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
 *  - exact matches (fr_FR → fr_FR, ja → ja),
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
  if (LOCALE_DIRS.includes(lng)) return lng;
  const base = lng.split(/[-_]/)[0].toLowerCase();
  if (LOCALE_DIRS.includes(base)) return base;
  return LOCALE_DIRS.find((dir) => dir.toLowerCase().split('_')[0] === base) ?? lng;
}
