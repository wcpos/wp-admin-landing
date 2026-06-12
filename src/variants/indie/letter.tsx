// src/variants/indie/letter.tsx
import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { readRuntime } from '../../shared/runtime';

const PHOTO_URL = `${readRuntime().constants.CDN_BASE.replace('/assets', '')}/assets/img/paul-urban-locavore.jpg`;

export const Letter = () => {
  const { t } = useTranslation('wp-admin-landing-indie');
  const rt = readRuntime();
  const { SHOP_OPENED, FIRST_RELEASE, PRICE_ANNUAL, PRICE_LIFETIME, yearsSince, yearsSinceRounded } = rt.constants;
  const [photoOk, setPhotoOk] = useState(true);
  const now = new Date();
  const vars = {
    yearsAgo: yearsSinceRounded(SHOP_OPENED, now),
    releaseYears: yearsSince(FIRST_RELEASE, now),
    annual: PRICE_ANNUAL,
    lifetime: PRICE_LIFETIME,
    month: now.toLocaleString(rt.i18next.language.replace('_', '-'), { month: 'long' }).toUpperCase(),
    year: now.getFullYear(),
  };
  const bold = { b: <b className="wcpos:text-gray-900" /> };

  return (
    <div className="wcpos:relative wcpos:rounded-sm wcpos:bg-[#fffefb] wcpos:p-10 wcpos:shadow-xl">
      <div aria-hidden className="wcpos:absolute wcpos:inset-x-0 wcpos:top-0 wcpos:h-[5px]"
        style={{ background: 'repeating-linear-gradient(90deg,#CD2C24 0 22px,#F5E5C0 22px 44px)' }} />
      {photoOk && (
        <figure className="wcpos:float-right wcpos:mb-3 wcpos:ml-5 wcpos:w-[218px] wcpos:rotate-[1.6deg] wcpos:bg-white wcpos:p-2.5 wcpos:shadow-lg">
          <img src={PHOTO_URL} alt={t('photo_caption')} loading="lazy" onError={() => setPhotoOk(false)} className="wcpos:w-full" />
          <figcaption className="wcpos:mt-2 wcpos:text-center wcpos:text-[11px] wcpos:text-gray-500">{t('photo_caption')}</figcaption>
        </figure>
      )}
      <p className="wcpos:mb-5 wcpos:text-xs wcpos:tracking-wide wcpos:text-gray-400">{t('eyebrow', vars)}</p>
      <p className="wcpos:mb-4 wcpos:text-xl wcpos:font-semibold wcpos:text-gray-900">{t('opening')}</p>
      <p className="wcpos:mb-4 wcpos:leading-relaxed">
        <Trans ns="wp-admin-landing-indie" i18nKey={photoOk ? 'para1' : 'para1_no_photo'} values={vars} components={bold} />
      </p>
      <p className="wcpos:mb-4 wcpos:leading-relaxed"><Trans ns="wp-admin-landing-indie" i18nKey="para2" components={bold} /></p>
      <p className="wcpos:mb-4 wcpos:leading-relaxed">{t('para3')}</p>
      <div className="wcpos:mt-6 wcpos:flex wcpos:items-center wcpos:gap-3.5">
        <span className="wcpos:flex wcpos:h-[52px] wcpos:w-[52px] wcpos:items-center wcpos:justify-center wcpos:rounded-full wcpos:bg-[#323A46] wcpos:font-bold wcpos:text-[#F5E5C0]">PK</span>
        <div>
          <div className="wcpos:text-sm wcpos:font-semibold">{t('sig_name')}</div>
          <div className="wcpos:text-xs wcpos:text-gray-500">{t('sig_meta')}</div>
        </div>
      </div>
      <p className="wcpos:mt-6 wcpos:border-t wcpos:border-[#efece4] wcpos:pt-4 wcpos:text-sm wcpos:text-gray-600">
        <Trans ns="wp-admin-landing-indie" i18nKey="ps" values={vars} components={bold} />
      </p>
    </div>
  );
};
