// src/variants/free-plus/comparison.tsx
import { useTranslation } from 'react-i18next';

const ROWS = [1, 2, 3, 4, 5, 6, 7] as const;
const FREE_ROWS = new Set([1]);

export const Comparison = () => {
  const { t } = useTranslation('wp-admin-landing-free-plus');
  return (
    <div className="wcpos:px-8 wcpos:pb-10 lg:wcpos:px-12">
      <div className="wcpos:mb-4 wcpos:flex wcpos:items-baseline wcpos:gap-3 wcpos:border-t wcpos:border-gray-100 wcpos:pt-6">
        <h2 className="wcpos:text-xl wcpos:font-semibold">{t('table_heading')}</h2>
        <span className="wcpos:text-xs wcpos:text-gray-400">{t('table_note')}</span>
      </div>
      <table className="wcpos:w-full wcpos:overflow-hidden wcpos:rounded-lg wcpos:border wcpos:border-gray-100 wcpos:text-sm">
        <thead>
          <tr>
            <th scope="col" className="wcpos:bg-gray-50 wcpos:p-3 wcpos:text-left wcpos:text-xs wcpos:font-semibold wcpos:uppercase wcpos:tracking-wide wcpos:text-gray-500">{t('col_what')}</th>
            <th scope="col" className="wcpos:w-20 wcpos:bg-gray-50 wcpos:p-3 wcpos:text-center wcpos:text-xs wcpos:font-semibold wcpos:uppercase wcpos:text-gray-500">{t('col_free')}</th>
            <th scope="col" className="wcpos:w-20 wcpos:bg-[#1A1F27] wcpos:p-3 wcpos:text-center wcpos:text-xs wcpos:font-semibold wcpos:uppercase wcpos:text-[#F5E5C0]">{t('col_pro')}</th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map((n) => (
            <tr key={n} className="wcpos:border-t wcpos:border-gray-50">
              <td className="wcpos:p-3">
                <div className="wcpos:font-semibold">{t(`row${n}_name`)}</div>
                <div className="wcpos:text-xs wcpos:text-gray-500">{t(`row${n}_desc`)}</div>
              </td>
              <td className="wcpos:p-3 wcpos:text-center">
                {FREE_ROWS.has(n)
                  ? <span className="wcpos:inline-flex wcpos:h-5 wcpos:w-5 wcpos:items-center wcpos:justify-center wcpos:rounded-full wcpos:bg-green-100 wcpos:text-xs wcpos:font-bold wcpos:text-green-700">✓</span>
                  : <span className="wcpos:text-gray-300">—</span>}
              </td>
              <td className="wcpos:bg-[#FBFAF6] wcpos:p-3 wcpos:text-center">
                <span className={FREE_ROWS.has(n)
                  ? 'wcpos:inline-flex wcpos:h-5 wcpos:w-5 wcpos:items-center wcpos:justify-center wcpos:rounded-full wcpos:bg-green-100 wcpos:text-xs wcpos:font-bold wcpos:text-green-700'
                  : 'wcpos:inline-flex wcpos:h-5 wcpos:w-5 wcpos:items-center wcpos:justify-center wcpos:rounded-full wcpos:bg-[#CD2C24] wcpos:text-xs wcpos:font-bold wcpos:text-white'}>✓</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
