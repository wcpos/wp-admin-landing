// src/variants/free-plus/comparison.tsx
import { useTranslation } from 'react-i18next';

const ROWS = [1, 2, 3, 4, 5, 6, 7] as const;
const FREE_ROWS = new Set([1]);

export const Comparison = () => {
  const { t } = useTranslation('wp-admin-landing-free-plus');
  const check = (tone: 'free' | 'pro') => (
    <span
      className={
        tone === 'free'
          ? 'wcpos:inline-flex wcpos:h-6 wcpos:w-6 wcpos:items-center wcpos:justify-center wcpos:rounded-full wcpos:bg-green-100 wcpos:text-[13px] wcpos:font-bold wcpos:text-green-700'
          : 'wcpos:inline-flex wcpos:h-6 wcpos:w-6 wcpos:items-center wcpos:justify-center wcpos:rounded-full wcpos:bg-[#CD2C24] wcpos:text-[13px] wcpos:font-bold wcpos:text-white'
      }
    >
      ✓
    </span>
  );
  return (
    <section className="wcpos:border-t wcpos:border-gray-100 wcpos:bg-gray-50/60 wcpos:px-8 wcpos:py-12 wcpos:lg:px-14">
      <div className="wcpos:mx-auto wcpos:max-w-3xl">
        <div className="wcpos:mb-5 wcpos:text-center">
          <h2 className="wcpos:text-2xl wcpos:font-bold wcpos:tracking-tight wcpos:text-gray-900">{t('table_heading')}</h2>
          <p className="wcpos:mt-1 wcpos:text-sm wcpos:text-gray-500">{t('table_note')}</p>
        </div>
        <div className="wcpos:overflow-hidden wcpos:rounded-xl wcpos:border wcpos:border-gray-200 wcpos:bg-white wcpos:shadow-sm">
          <table className="wcpos:w-full wcpos:text-sm">
            <thead>
              <tr>
                <th scope="col" className="wcpos:p-4 wcpos:text-left wcpos:text-[11px] wcpos:font-semibold wcpos:uppercase wcpos:tracking-wider wcpos:text-gray-400">{t('col_what')}</th>
                <th scope="col" className="wcpos:w-24 wcpos:p-4 wcpos:text-center wcpos:text-[11px] wcpos:font-semibold wcpos:uppercase wcpos:tracking-wider wcpos:text-gray-400">{t('col_free')}</th>
                <th scope="col" className="wcpos:w-24 wcpos:bg-[#1A1F27] wcpos:p-4 wcpos:text-center wcpos:text-[11px] wcpos:font-bold wcpos:uppercase wcpos:tracking-wider wcpos:text-[#F5E5C0]">{t('col_pro')}</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((n) => (
                <tr key={n} className="wcpos:border-t wcpos:border-gray-100">
                  <td className="wcpos:p-4">
                    <div className="wcpos:font-semibold wcpos:text-gray-900">{t(`row${n}_name`)}</div>
                    <div className="wcpos:mt-0.5 wcpos:text-xs wcpos:leading-relaxed wcpos:text-gray-500">{t(`row${n}_desc`)}</div>
                  </td>
                  <td className="wcpos:p-4 wcpos:text-center wcpos:align-middle">
                    {FREE_ROWS.has(n) ? check('free') : <span className="wcpos:text-gray-300">—</span>}
                  </td>
                  <td className="wcpos:bg-[#FBFAF6] wcpos:p-4 wcpos:text-center wcpos:align-middle">
                    {check(FREE_ROWS.has(n) ? 'free' : 'pro')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
