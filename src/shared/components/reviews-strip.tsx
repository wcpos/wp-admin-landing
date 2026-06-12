import { useTranslation } from 'react-i18next';
import { readRuntime } from '../runtime';
import reviews from '../wporg-reviews.json';

export const ReviewsStrip = () => {
  const { t, i18n } = useTranslation();
  const rt = readRuntime();
  return (
    <section className="wcpos:border-t wcpos:border-gray-100 wcpos:bg-white wcpos:px-8 wcpos:py-8 lg:wcpos:px-12">
      <h4 className="wcpos:mb-4 wcpos:text-xs wcpos:font-bold wcpos:uppercase wcpos:tracking-wider wcpos:text-gray-500">
        {t('reviews_heading')}
      </h4>
      <div className="wcpos:grid wcpos:gap-4 lg:wcpos:grid-cols-3">
        {reviews.reviews.map((r) => {
          const quote = r.translated && i18n.language.startsWith('fr') && (r as { quote_fr?: string }).quote_fr ? (r as { quote_fr?: string }).quote_fr! : r.quote_en;
          const showTranslated = r.translated && !i18n.language.startsWith('fr');
          return (
            <article key={r.author} className="wcpos:flex wcpos:flex-col wcpos:rounded-lg wcpos:border wcpos:border-gray-100 wcpos:bg-gray-50 wcpos:p-4">
              <div className="wcpos:mb-2 wcpos:flex wcpos:items-center wcpos:gap-3">
                {r.avatar ? (
                  <img src={r.avatar} alt="" width={38} height={38} loading="lazy" className="wcpos:rounded-full" />
                ) : (
                  <span className="wcpos:flex wcpos:h-[38px] wcpos:w-[38px] wcpos:items-center wcpos:justify-center wcpos:rounded-full wcpos:bg-gray-400 wcpos:font-bold wcpos:text-white">
                    {r.author[0].toUpperCase()}
                  </span>
                )}
                <div>
                  <b className="wcpos:block wcpos:text-sm">{r.author}</b>
                  <span className="wcpos:text-xs wcpos:text-gray-400">{r.context}</span>
                </div>
              </div>
              <span aria-label={`${r.stars} stars`} className="wcpos:mb-1 wcpos:tracking-widest wcpos:text-amber-500">★★★★★</span>
              <p className="wcpos:mb-3 wcpos:flex-1 wcpos:text-sm wcpos:leading-relaxed">
                "{quote}"{showTranslated && <em className="wcpos:block wcpos:text-xs wcpos:text-gray-400">{t('translated_from_french')}</em>}
              </p>
              <a href={r.url} target="_blank" rel="noreferrer" className="wcpos:text-xs wcpos:font-semibold wcpos:text-[#A82320]">
                {t('read_on_wporg')}
              </a>
            </article>
          );
        })}
      </div>
      <div className="wcpos:mt-4 wcpos:flex wcpos:items-center wcpos:gap-3 wcpos:rounded-lg wcpos:border wcpos:border-amber-100 wcpos:bg-amber-50 wcpos:px-4 wcpos:py-3 wcpos:text-sm">
        <span className="wcpos:tracking-widest wcpos:text-amber-500">★★★★★</span>
        <span>{t('review_cta_line')}</span>
        <a
          href={rt.constants.REVIEW_URL}
          target="_blank"
          rel="noreferrer"
          onClick={() => rt.trackEvent('review_cta_clicked')}
          className="wcpos:ml-auto wcpos:whitespace-nowrap wcpos:font-semibold wcpos:text-[#A82320]"
        >
          {t('review_cta_link')}
        </a>
      </div>
    </section>
  );
};
