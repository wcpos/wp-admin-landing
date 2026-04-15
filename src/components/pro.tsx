import { useTranslation } from 'react-i18next';
import { trackEvent } from '../lib/analytics';
import { Button } from './button';

export const Pro = () => {
  const { t } = useTranslation();

  return (
    <div className="wcpos:bg-gray-50 wcpos:p-6 wcpos:rounded-lg">
      <h2 className="wcpos:text-2xl wcpos:font-semibold wcpos:m-0">{t('upgrade_to_pro')}</h2>
      <ul className="wcpos:list-disc wcpos:pl-6">
        <li>{t('use_any_wc_gateway')}</li>
        <li>{t('create_multiple_stores')}</li>
        <li>{t('analytics_for_sales')}</li>
        <li>{t('priority_discord_support')}</li>
      </ul>

      <Button
        href="https://wcpos.com/pro"
        target="_blank"
        onClick={() => trackEvent('upgrade_cta_clicked')}
      >
        {t('upgrade_to_pro')}
      </Button>
    </div>
  );
};
