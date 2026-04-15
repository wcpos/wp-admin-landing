import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import ChainedBackend from 'i18next-chained-backend';
import LocalStorageBackend from 'i18next-localstorage-backend';
import HttpBackend from 'i18next-http-backend';
import { getLandingData } from './landing-data';
import en from '../translations/en/wp-admin-landing.json';

const NAMESPACE = 'wp-admin-landing';
const PROJECT = 'woocommerce-pos';

export function initI18n(): typeof i18next {
  const data = getLandingData();
  const locale = data?.profile?.locale ?? 'en_US';

  i18next
    .use(ChainedBackend)
    .use(initReactI18next)
    .init({
      lng: locale,
      fallbackLng: 'en_US',
      ns: [NAMESPACE],
      defaultNS: NAMESPACE,
      keySeparator: false,
      nsSeparator: false,
      interpolation: {
        prefix: '{',
        suffix: '}',
      },
      react: {
        useSuspense: false,
      },
      partialBundledLanguages: true,
      resources: {
        en_US: { [NAMESPACE]: en },
      },
      backend: {
        backends: [LocalStorageBackend, HttpBackend],
        backendOptions: [
          {
            prefix: 'wcpos_i18n_',
            expirationTime: 7 * 24 * 60 * 60 * 1000, // 7 days
          },
          {
            loadPath: `https://cdn.jsdelivr.net/gh/wcpos/translations@main/translations/js/{{lng}}/${PROJECT}/${NAMESPACE}.json`,
          },
        ],
      },
    });

  return i18next;
}
