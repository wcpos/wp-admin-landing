// src/variants/plan/plans.tsx
import { useTranslation } from 'react-i18next';
import { readRuntime } from '../../shared/runtime';
import { Buy, NS } from './buy';

const FREE_ITEMS = [1, 2, 3] as const;
const PRO_ITEMS = [1, 2, 3, 4, 5, 6, 7, 8] as const;
/** Below 940px the Pro card shows this many results; the rest sit in a native <details>. */
const PRO_STACKED_VISIBLE = 4;

const Checks = ({ prefix, items, className = '' }: { prefix: string; items: readonly number[]; className?: string }) => {
  const { t } = useTranslation(NS);
  return (
    <ul className={`plan-checks ${className}`}>
      {items.map((n) => (
        <li key={n}>
          <b>{t(`${prefix}${n}_title`)}</b>
          <span>{t(`${prefix}${n}_desc`)}</span>
        </li>
      ))}
    </ul>
  );
};

export const Header = ({ proActive }: { proActive: boolean }) => {
  const { t } = useTranslation(NS);
  const { INSTALL_COUNT, FIRST_RELEASE } = readRuntime().constants;
  const proof = { installs: INSTALL_COUNT, year: FIRST_RELEASE.getUTCFullYear() };
  return (
    <header className="plan-head">
      <div className="plan-eyebrow">
        <p className="plan-marker">{t(proActive ? 'marker_pro' : 'marker_free')}</p>
        <p className="plan-installs plan-installs-top">{t('proof_long', proof)}</p>
      </div>
      <p className="plan-installs plan-installs-below">{t('proof_short', proof)}</p>
      <h1>{t(proActive ? 'headline_pro' : 'headline')}</h1>
    </header>
  );
};

export const Plans = ({ proActive }: { proActive: boolean }) => {
  const { t } = useTranslation(NS);
  const { t: ts } = useTranslation();
  const current = <span className="plan-current">{t('current_plan')}</span>;
  return (
    <section className="plan-cards" aria-label={t('plans_label')}>
      <div className="plan-free-col">
        <article className="plan-tier plan-tier-free">
          <div className="plan-tier-top">
            <h2>{t('free_title')}</h2>
            {!proActive && current}
          </div>
          <p className="plan-cost"><b>{t('free_price')}</b>{t('free_price_note')}</p>
          <p className="plan-lead">{t('free_lead')}</p>
          <Checks prefix="free" items={FREE_ITEMS} />
          <p className="plan-note">{t('free_note')}</p>
        </article>
        {!proActive && (
          <div className="plan-enough">
            <h3>{t('enough_title')}</h3>
            <p>{t('enough_body')}</p>
          </div>
        )}
      </div>
      <article className="plan-tier plan-tier-pro">
        <div className="plan-band"><h2>{t('pro_title')}</h2></div>
        {proActive ? (
          <div className="plan-buy plan-thanks">
            {current}
            <p>{ts('pro_active_thanks')}</p>
          </div>
        ) : (
          <Buy location="plan_card" />
        )}
        <p className="plan-lead">{t('pro_lead')}</p>
        <Checks prefix="pro" items={PRO_ITEMS} className="plan-pro-all" />
        <div className="plan-pro-stacked">
          <Checks prefix="pro" items={PRO_ITEMS.slice(0, PRO_STACKED_VISIBLE)} />
          <details className="plan-more">
            <summary>{t('more_pro')}</summary>
            <Checks prefix="pro" items={PRO_ITEMS.slice(PRO_STACKED_VISIBLE)} />
          </details>
        </div>
        <p className="plan-list-note">{t('support_note')}</p>
      </article>
    </section>
  );
};
