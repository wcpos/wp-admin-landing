// src/shared/i18n.ts
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import ChainedBackend from 'i18next-chained-backend';
import LocalStorageBackend from 'i18next-localstorage-backend';
import HttpBackend from 'i18next-http-backend';
import { getLandingData } from './landing-data';
import sharedEn from '../translations/en/wp-admin-landing-shared.json';

export const SHARED_NS = 'wp-admin-landing-shared';

/** Bootstrap initialises shared strings; the variant chunk adds its own
 *  namespace via addVariantNamespace() (spec §4: one namespace per variant). */
export function initI18n(): typeof i18next {
  const locale = getLandingData()?.locale ?? 'en_US';
  i18next
    .use(ChainedBackend)
    .use(initReactI18next)
    .init({
      lng: locale,
      fallbackLng: 'en_US',
      ns: [SHARED_NS],
      defaultNS: SHARED_NS,
      keySeparator: false,
      nsSeparator: false,
      interpolation: { prefix: '{', suffix: '}' },
      react: { useSuspense: false },
      partialBundledLanguages: true,
      resources: { en_US: { [SHARED_NS]: sharedEn } },
      backend: {
        backends: [LocalStorageBackend, HttpBackend],
        backendOptions: [
          { prefix: 'wcpos_i18n_', expirationTime: 7 * 24 * 60 * 60 * 1000 },
          // Self-contained: locale files live in this repo beside src/translations/en/
          // and ship with the same release tag as the bundles. Locale dirs use WP locale
          // codes (fr_FR, de_DE, es_ES, it_IT, nl_NL, pt_BR, ja, zh_CN, ko_KR, ar, hi_IN).
          // Missing locale files 404 → chained backend falls back to bundled English
          // (expected until translations are generated).
          { loadPath: 'https://cdn.jsdelivr.net/gh/wcpos/wp-admin-landing@v2/src/translations/{{lng}}/{{ns}}.json' },
        ],
      },
    });
  return i18next;
}

/** Called by the variant chunk: registers its bundled English source and
 *  triggers the CDN load for the active locale. */
export function addVariantNamespace(i18n: typeof i18next, ns: string, en: Record<string, string>): Promise<unknown> {
  i18n.addResourceBundle('en_US', ns, en, true, false);
  return i18n.loadNamespaces(ns);
}
