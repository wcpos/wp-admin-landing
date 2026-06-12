import { useTranslation } from 'react-i18next';
import { readRuntime } from '../runtime';

export const ProofChip = () => {
  const { t } = useTranslation();
  const { INSTALL_COUNT } = readRuntime().constants;
  return (
    <div className="wcpos:flex wcpos:items-center wcpos:gap-4 wcpos:rounded-lg wcpos:border wcpos:border-gray-200 wcpos:bg-white wcpos:p-4">
      <span className="wcpos:text-2xl wcpos:font-bold">{INSTALL_COUNT}</span>
      <span className="wcpos:whitespace-pre-line wcpos:text-xs wcpos:text-gray-600">{t('proof_chip_line')}</span>
    </div>
  );
};
