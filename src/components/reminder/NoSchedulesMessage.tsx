import { FC } from 'react';
import { useTranslation } from 'react-i18next';

export const NoSchedulesMessage: FC = () => {
  const { t } = useTranslation();

  return (
    <div className="text-sm text-[var(--tg-theme-hint-color)] text-center py-4 bg-[var(--tg-theme-secondary-bg-color)] rounded-lg">
      {t('reminder.noSchedules')}
    </div>
  );
};
