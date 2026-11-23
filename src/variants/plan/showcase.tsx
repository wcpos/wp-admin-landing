// src/variants/plan/showcase.tsx
import { useTranslation } from 'react-i18next';
import { readRuntime } from '../../shared/runtime';
import reviews from '../../shared/wporg-reviews.json';
import { NS } from './buy';

/** WCPOS 2.0 screenshots (from the 2.x docs), one size each: the sources are no
 *  larger than this, so there is nothing to build a second srcset entry from. */
const SHOTS = [
  { key: 'refund', file: 'plan-refund-form', width: 560, height: 768, lead: true },
  { key: 'products', file: 'plan-products-list', width: 1024, height: 768, lead: false },
  { key: 'reports', file: 'plan-reports', width: 1024, height: 768, lead: false },
] as const;

export const Shots = () => {
  const { t } = useTranslation(NS);
  const imgBase = `${readRuntime().constants.CDN_BASE}/img`;
  return (
    <section className="plan-shots" aria-labelledby="plan-shots-h">
      <h2 id="plan-shots-h">{t('shots_heading')}</h2>
      <div className="plan-shot-grid">
        {SHOTS.map((s) => (
          <figure key={s.key} className={s.lead ? 'plan-shot-lead' : undefined}>
            <picture>
              <source type="image/webp" srcSet={`${imgBase}/${s.file}.webp`} />
              <img src={`${imgBase}/${s.file}.png`} width={s.width} height={s.height} loading="lazy" alt={t(`shot_${s.key}_alt`)} />
            </picture>
            <figcaption>{t(`shot_${s.key}_caption`)}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
};

/** The shared review snapshot, drawn as the mockup's cards: stars above a
 *  verbatim quote; adeline's original French for fr locales, as ReviewsStrip does. */
export const Reviews = () => {
  const { t, i18n } = useTranslation(NS);
  const { t: ts } = useTranslation();
  const fr = i18n.language.startsWith('fr');
  return (
    <section className="plan-reviews" aria-labelledby="plan-reviews-h">
      <h2 id="plan-reviews-h">{t('reviews_heading')}</h2>
      <div className="plan-review-list">
        {reviews.reviews.map((r) => {
          const quoteFr = (r as { quote_fr?: string }).quote_fr;
          const showFr = r.translated && fr && !!quoteFr;
          return (
            <figure key={r.author} className="plan-review">
              <div className="plan-stars" role="img" aria-label={t('stars_label', { stars: r.stars })}>
                {'★'.repeat(r.stars)}
              </div>
              <blockquote>
                “{showFr ? quoteFr : r.quote_en}”
                {r.translated && !showFr && <span className="plan-tr">{ts('translated_from_french')}</span>}
              </blockquote>
              <figcaption>
                <b>{r.author}</b>, {r.context}
                <br />
                <a href={r.url} target="_blank" rel="noreferrer">{ts('read_on_wporg')}</a>
              </figcaption>
            </figure>
          );
        })}
      </div>
    </section>
  );
};
