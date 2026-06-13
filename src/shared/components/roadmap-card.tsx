import { Trans, useTranslation } from 'react-i18next';
import { readRuntime } from '../runtime';
import roadmap from '../roadmap.json';
import { CtaRow } from './cta-row';

export const RoadmapCard = () => {
  const { t } = useTranslation();
  const rt = readRuntime();
  return (
    <div className="wcpos:rounded-xl wcpos:bg-[#1A1F27] wcpos:p-6 wcpos:text-gray-200 wcpos:shadow-xl">
      <h3 className="wcpos:text-lg wcpos:font-semibold wcpos:text-white">{t('roadmap_title')}</h3>
      <p className="wcpos:mb-4 wcpos:text-xs wcpos:text-gray-400">
        <a
          href={rt.constants.ROADMAP_URL}
          target="_blank"
          rel="noreferrer"
          onClick={() => rt.trackEvent('roadmap_widget_engaged')}
          className="wcpos:text-[#F5E5C0] wcpos:underline"
        >
          {t('roadmap_subtitle')}
        </a>
      </p>
      <ul>
        {roadmap.done.map((item) => (
          <li key={item} className="wcpos:flex wcpos:items-baseline wcpos:gap-3 wcpos:border-b wcpos:border-gray-700 wcpos:py-2 wcpos:text-sm">
            <span className="wcpos:rounded wcpos:bg-green-700 wcpos:px-1.5 wcpos:text-[10px] wcpos:font-bold wcpos:text-white">{t('roadmap_done')}</span>
            {item}
          </li>
        ))}
        {roadmap.next.map((item) => (
          <li key={item} className="wcpos:flex wcpos:items-baseline wcpos:gap-3 wcpos:border-b wcpos:border-gray-700 wcpos:py-2 wcpos:text-sm last:wcpos:border-0">
            <span className="wcpos:rounded wcpos:bg-amber-600 wcpos:px-1.5 wcpos:text-[10px] wcpos:font-bold wcpos:text-white">{t('roadmap_next')}</span>
            {item}
          </li>
        ))}
      </ul>
      <p className="wcpos:mt-3 wcpos:rounded-md wcpos:bg-[#232a33] wcpos:p-3 wcpos:text-xs wcpos:leading-relaxed wcpos:text-gray-400">
        <Trans i18nKey="roadmap_listen" components={{ b: <b className="wcpos:text-[#F5E5C0]" /> }} />
      </p>
      <div className="wcpos:mt-4 wcpos:border-t wcpos:border-gray-700 wcpos:pt-4">
        <CtaRow location="roadmap_card" />
      </div>
    </div>
  );
};
