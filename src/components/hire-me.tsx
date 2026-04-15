import { useTranslation, Trans } from 'react-i18next';
import { trackEvent } from '../lib/analytics';

export const HireMe = () => {
  const { t } = useTranslation();

  return (
    <div className="wcpos:bg-gray-50 wcpos:p-6 wcpos:rounded-lg">
      <h2 className="wcpos:text-2xl wcpos:font-semibold wcpos:m-0">{t('hire_me')}</h2>

      <p>{t('available_for_contract')}</p>

      <ul className="wcpos:list-disc wcpos:pl-6">
        <li>{t('hire_skill_wordpress')}</li>
        <li>{t('hire_skill_react')}</li>
        <li>{t('hire_skill_plugin')}</li>
      </ul>

      <Trans i18nKey="hire_email_prompt">
        Email{' '}
        <a
          href="mailto:paul@wcpos.com"
          onClick={() => trackEvent('hire_me_clicked')}
        >
          paul@wcpos.com
        </a>{' '}
        with your project.
      </Trans>
    </div>
  );
};
