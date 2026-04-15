import { useTranslation } from 'react-i18next';
import { trackEvent } from '../lib/analytics';
import { Button } from './button';

export const Review = () => {
  const { t } = useTranslation();
  const reviewPageUrl = 'https://wordpress.org/support/plugin/woocommerce-pos/reviews/#new-post';

  return (
    <div className="wcpos:bg-gray-50 wcpos:p-6 wcpos:rounded-lg wcpos:space-y-4">
      <h2 className="wcpos:text-2xl wcpos:font-semibold wcpos:m-0">{t('leave_a_review')}</h2>
      <p>{t('review_description')}</p>

      <Button
        href={reviewPageUrl}
        target="_blank"
        onClick={() => trackEvent('review_link_clicked')}
      >
        {t('leave_a_review')}
      </Button>
    </div>
  );
};
