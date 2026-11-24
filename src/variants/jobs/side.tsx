// src/variants/jobs/side.tsx
import { useTranslation } from 'react-i18next';
import { readRuntime } from '../../shared/runtime';
import reviews from '../../shared/wporg-reviews.json';

export const NS = 'wp-admin-landing-jobs';
const FREE_ITEMS = [1, 2, 3, 4, 5, 6, 7] as const;
const REVIEW_AUTHOR = 'nckllnpssy';
/** The mockup quotes this review from here on, marking the cut with […]. */
const REVIEW_CUT = 'nearly overlooked';

/** The purchase card: title, both prices, the site allowance, Get Pro and the
 *  licence line. Keeps the shared CtaRow contract (click event, decorated URL,
 *  exp-202608 price visibility, the shared price string split on ` · `). Pro
 *  owners see the shared thank-you line instead of the prices and button. */
export const Buy = ({ location, proActive = false }: { location: 'jobs_card' | 'jobs_closing'; proActive?: boolean }) => {
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
    <section className={`jobs-door jobs-yes ${location === 'jobs_closing' ? 'jobs-closing' : 'jobs-card'}`} aria-labelledby={`${location}-h`}>
      <h2 id={`${location}-h`}>{t('pro_title')}</h2>
      {proActive ? (
        <p className="jobs-thanks">{ts('pro_active_thanks')}</p>
      ) : (
        <>
          <p className="jobs-price"><span className="jobs-price-in">{prices.map((p) => <span key={p} className="jobs-pp">{p}</span>)}</span></p>
          <p className="jobs-per">{t('licence_scope')}</p>
          <a
            className="jobs-btn"
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
            <span className="jobs-vh">{t('opens_new_tab')}</span>
          </a>
          <p className="jobs-fair">{t('licence_terms')}</p>
        </>
      )}
    </section>
  );
};

/** "None of these? Free is enough" — for Pro owners, what every plan includes. */
export const Enough = ({ proActive }: { proActive: boolean }) => {
  const { t } = useTranslation(NS);
  return (
    <section className="jobs-door jobs-no" aria-labelledby="jobs-no-h">
      <h2 id="jobs-no-h">{t(proActive ? 'no_title_pro' : 'no_title')}</h2>
      {!proActive && <p className="jobs-then">{t('no_then')}</p>}
      <ul>{FREE_ITEMS.map((n) => <li key={n}>{t(`free${n}`)}</li>)}</ul>
      <p className="jobs-terms">{t(proActive ? 'no_terms_pro' : 'no_terms')}</p>
    </section>
  );
};

/** One verbatim review from the shared WordPress.org snapshot. */
export const Review = () => {
  const { t } = useTranslation(NS);
  const { t: ts } = useTranslation();
  const r = reviews.reviews.find((x) => x.author === REVIEW_AUTHOR);
  if (!r) return null;
  const cut = r.quote_en.indexOf(REVIEW_CUT);
  return (
    <figure className="jobs-review">
      <div className="jobs-stars" role="img" aria-label={t('stars_label', { stars: r.stars })}>{'★'.repeat(r.stars)}</div>
      <blockquote>“{cut > 0 ? `[…] ${r.quote_en.slice(cut)}` : r.quote_en}”</blockquote>
      <figcaption>
        <b>{r.author}</b>, {r.context}
        <br />
        <a href={r.url} target="_blank" rel="noreferrer">{ts('read_on_wporg')}</a>
      </figcaption>
    </figure>
  );
};
