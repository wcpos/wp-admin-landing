import { useTranslation } from 'react-i18next';
import { Badge } from './badge';

export const Hero = () => {
  const { t } = useTranslation();

  return (
    <div className="wcpos:space-y-2 wcpos:lg:space-y-4">
      <Badge>{t('support_the_project')}</Badge>
      <p className="wcpos:text-3xl wcpos:font-bold wcpos:lg:text-4xl">{t('hero_title')}</p>
      <p className="wcpos:max-w-[900px] wcpos:text-xl wcpos:leading-8">
        {t('hero_description')}
      </p>
      <p className="wcpos:max-w-[900px] wcpos:text-base">{t('ways_to_help')}</p>
      <ul className="wcpos:max-w-[900px] wcpos:text-base">
        <li>
          <span className="wcpos:text-2xl wcpos:mr-2">🚀</span>
          <strong>{t('upgrade_to_pro_label')}</strong><br />
          <span className="wcpos:text-gray-600">{t('upgrade_to_pro_description')}</span>
        </li>
        <li>
          <span className="wcpos:text-2xl wcpos:mr-2">💖</span>
          <strong>{t('donate_label')}</strong><br />
          <span className="wcpos:text-gray-600">{t('donate_description')}</span>
        </li>
        <li>
          <span className="wcpos:text-2xl wcpos:mr-2">✍️</span>
          <strong>{t('leave_review_label')}</strong><br />
          <span className="wcpos:text-gray-600">{t('leave_review_description')}</span>
        </li>
        <li>
          <span className="wcpos:text-2xl wcpos:mr-2">👩‍💻</span>
          <strong>{t('hire_me_label')}</strong><br />
          <span className="wcpos:text-gray-600">{t('hire_me_description')}</span>
        </li>
      </ul>
      <p className="wcpos:max-w-[900px] wcpos:text-base">{t('support_thanks')}</p>
    </div>
  );
};
