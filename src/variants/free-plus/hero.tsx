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
    <div className="wcpos:grid wcpos:items-center wcpos:gap-10 wcpos:p-8 wcpos:lg:grid-cols-2 wcpos:lg:gap-12 wcpos:lg:p-14">
      <div className="wcpos:flex wcpos:flex-col wcpos:items-start wcpos:gap-5">
        <span className="wcpos:inline-flex wcpos:items-center wcpos:gap-2 wcpos:rounded-full wcpos:bg-[#F5E5C0] wcpos:px-3 wcpos:py-1 wcpos:text-[11px] wcpos:font-bold wcpos:uppercase wcpos:tracking-widest wcpos:text-[#996a13]">
          {t('kicker')}
        </span>
        <h1 className="wcpos:text-4xl wcpos:font-bold wcpos:leading-[1.08] wcpos:tracking-tight wcpos:text-gray-900 wcpos:lg:text-5xl">
          {t('headline_1')}<br /><span className="wcpos:text-[#CD2C24]">{t('headline_2')}</span>
        </h1>
        <p className="wcpos:max-w-md wcpos:text-[15px] wcpos:leading-relaxed wcpos:text-gray-600">
          <Trans ns="wp-admin-landing-free-plus" i18nKey="sub" components={{ b: <b className="wcpos:font-semibold wcpos:text-gray-900" /> }} />
        </p>
        <div className="wcpos:mt-1 wcpos:flex wcpos:flex-col wcpos:gap-2">
          <CtaRow location="hero" />
          <span className="wcpos:text-xs wcpos:text-gray-400">{ts('fair_licence')}</span>
        </div>
      </div>
      <figure className="wcpos:m-0">
        <div className="wcpos:rounded-xl wcpos:bg-gradient-to-br wcpos:from-[#F5E5C0]/40 wcpos:to-gray-100 wcpos:p-3 wcpos:shadow-[0_24px_60px_-24px_rgba(26,31,39,0.45)] wcpos:ring-1 wcpos:ring-gray-900/5">
          <picture>
            <source type="image/webp" srcSet={`${imgBase}/reports-hero.webp 2048w, ${imgBase}/reports-hero-1024.webp 1024w`} sizes="(min-width: 1024px) 512px, 100vw" />
            <img
              src={`${imgBase}/reports-hero.png`}
              alt={t('hero_img_alt')}
              loading="lazy"
              width={2048}
              height={1536}
              className="wcpos:block wcpos:h-auto wcpos:w-full wcpos:rounded-lg wcpos:ring-1 wcpos:ring-gray-900/10"
            />
          </picture>
        </div>
        <figcaption className="wcpos:mt-3 wcpos:text-center wcpos:text-[11px] wcpos:text-gray-500">{t('hero_img_caption')}</figcaption>
      </figure>
    </div>
  );
};
