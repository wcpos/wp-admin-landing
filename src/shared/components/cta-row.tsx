import { useTranslation } from 'react-i18next';
import { readRuntime } from '../runtime';

/** Single red Get Pro CTA + price line. Price visibility is keyed to
 *  exp-202608 (spec §6.2 #3): control shows both prices everywhere. */
export const CtaRow = ({ location }: { location: string }) => {
  const { t } = useTranslation();
  const rt = readRuntime();
  const { PRICE_ANNUAL, PRICE_LIFETIME, PRO_URL } = rt.constants;
  const annualOnly = rt.posthog.getFeatureFlag('exp-202608-all-price-visibility') === 'annual-only';
  const href = rt.decorateOutboundUrl(PRO_URL, rt.variant);

  if (rt.getLandingData()?.pro_active) {
    return <p className="wcpos:text-sm wcpos:text-gray-500">{t('pro_active_thanks')}</p>;
  }
  return (
    <div className="wcpos:flex wcpos:flex-wrap wcpos:items-center wcpos:gap-4">
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        onClick={() => rt.trackEvent('upgrade_cta_clicked', { cta_location: location, href })}
        className="wcpos:inline-flex wcpos:items-center wcpos:rounded-md wcpos:bg-[#CD2C24] wcpos:px-6 wcpos:py-2.5 wcpos:text-sm wcpos:font-semibold wcpos:text-white wcpos:shadow-md wcpos:hover:bg-[#A82320]"
      >
        {t('get_pro')}
      </a>
      <span className="wcpos:text-sm wcpos:text-gray-600">
        {annualOnly
          ? t('price_annual_only', { annual: PRICE_ANNUAL })
          : t('price_both', { annual: PRICE_ANNUAL, lifetime: PRICE_LIFETIME })}
      </span>
    </div>
  );
};
