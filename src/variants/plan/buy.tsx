// src/variants/plan/buy.tsx
import { useTranslation } from 'react-i18next';
import { readRuntime } from '../../shared/runtime';

export const NS = 'wp-admin-landing-plan';

/** Get Pro + both prices + licence scope + the one licence line. The shared
 *  CtaRow's single-line layout does not fit this card, so the variant draws its
 *  own block but keeps CtaRow's contract: same click event and URL decoration,
 *  same exp-202608 price visibility, and the shared price string — split on its
 *  ` · ` separator (present in every locale) so each price wraps as a unit. */
export const Buy = ({ location }: { location: 'plan_card' | 'plan_closing' }) => {
  const { t } = useTranslation(NS);
  const { t: ts } = useTranslation();
  const rt = readRuntime();
  const { PRICE_ANNUAL, PRICE_LIFETIME, PRO_URL } = rt.constants;
  const annualOnly = rt.posthog.getFeatureFlag('exp-202608-all-price-visibility') === 'annual-only';
  const href = rt.decorateOutboundUrl(PRO_URL, rt.variant);
  const prices = annualOnly
    ? [ts('price_annual_only', { annual: PRICE_ANNUAL })]
    : ts('price_both', { annual: PRICE_ANNUAL, lifetime: PRICE_LIFETIME }).split(' · ');
  return (
    <div className="plan-buy">
      <a
        className="plan-btn"
        href={href}
        target="_blank"
        rel="noreferrer"
        onClick={() => rt.trackEvent('upgrade_cta_clicked', { cta_location: location, href })}
      >
        {ts('get_pro')}
        <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
          <path
            d="M9.5 2H14v4.5M14 2 7.5 8.5M12 9.5V13a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h3.5"
            fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
          />
        </svg>
        <span className="plan-vh">{t('opens_new_tab')}</span>
      </a>
      <span className="plan-price">
        <span className="plan-price-in">
          {prices.map((p) => <span key={p} className="plan-pp">{p}</span>)}
        </span>
      </span>
      <span className="plan-per">{t('licence_scope')}</span>
      <p className="plan-fair">{t('licence_terms')}</p>
    </div>
  );
};
