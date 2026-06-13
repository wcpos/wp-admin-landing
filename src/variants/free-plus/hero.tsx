// src/variants/free-plus/hero.tsx
import { Trans, useTranslation } from 'react-i18next';
import { readRuntime } from '../../shared/runtime';
import { CtaRow } from '../../shared/components/cta-row';

export const Hero = () => {
  const { t } = useTranslation('wp-admin-landing-free-plus');
  const { t: ts } = useTranslation('wp-admin-landing-shared');
  const rt = readRuntime();
  const imgBase = `${rt.constants.CDN_BASE}/img`;
  return (
    <div className="wcpos:grid wcpos:gap-8 lg:wcpos:grid-cols-2">
      <div className="wcpos:flex wcpos:flex-col wcpos:items-start wcpos:gap-4 wcpos:p-8 lg:wcpos:p-12 lg:wcpos:pr-0">
        <span className="wcpos:inline-flex wcpos:items-center wcpos:gap-2 wcpos:rounded-full wcpos:bg-[#F5E5C0] wcpos:px-3 wcpos:py-1 wcpos:text-[11px] wcpos:font-bold wcpos:uppercase wcpos:tracking-widest wcpos:text-[#996a13]">
          {t('kicker')}
        </span>
        <h1 className="wcpos:text-4xl wcpos:font-bold wcpos:leading-tight wcpos:tracking-tight">
          {t('headline_1')}<br /><span className="wcpos:text-[#CD2C24]">{t('headline_2')}</span>
        </h1>
        <p className="wcpos:max-w-md wcpos:leading-relaxed wcpos:text-gray-600">
          <Trans ns="wp-admin-landing-free-plus" i18nKey="sub" components={{ b: <b className="wcpos:text-gray-900" /> }} />
        </p>
        <CtaRow location="hero" />
        <span className="wcpos:text-xs wcpos:text-gray-400">{ts('fair_licence')}</span>
      </div>
      <figure className="wcpos:m-0 wcpos:flex wcpos:flex-col wcpos:justify-center wcpos:p-8 lg:wcpos:p-10">
        <picture>
          <source type="image/webp" srcSet={`${imgBase}/reports-hero.webp 2048w, ${imgBase}/reports-hero-1024.webp 1024w`} sizes="(min-width: 1024px) 512px, 100vw" />
          <img
            src={`${imgBase}/reports-hero.png`}
            alt={t('hero_img_alt')}
            loading="lazy"
            width={2048}
            height={1536}
            className="wcpos:w-full wcpos:rounded wcpos:shadow-xl"
          />
        </picture>
        <figcaption className="wcpos:mt-2 wcpos:text-center wcpos:text-[11px] wcpos:text-gray-500">{t('hero_img_caption')}</figcaption>
      </figure>
    </div>
  );
};
