import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useReminders } from '@/hooks/useReminders';
import { ReminderCard } from '@/components/reminder/ReminderCard';
import { SkeletonCard } from '@/components/shared/Skeleton';
import { Button } from '@/components/shared/Button';

export const ListPage: FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: reminders, isLoading, error } = useReminders();

  const handleCreate = () => {
    navigate('/create');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--tg-theme-bg-color)] p-4">
        <div className="max-w-2xl mx-auto space-y-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--tg-theme-bg-color)] p-4">
        <div className="max-w-2xl mx-auto text-center py-12">
          <p className="text-red-500 mb-4">{t('common.error')}</p>
          <Button onClick={() => window.location.reload()}>{t('common.retry')}</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--tg-theme-bg-color)] p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-[var(--tg-theme-text-color)]">
            {t('reminder.title')}
          </h1>
          <Button onClick={handleCreate}>{t('common.create')}</Button>
        </div>

        {!reminders || reminders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[var(--tg-theme-hint-color)] mb-2">{t('reminder.noReminders')}</p>
            <p className="text-[var(--tg-theme-hint-color)] text-sm mb-6">
              {t('reminder.createFirst')}
            </p>
            <Button onClick={handleCreate}>{t('common.create')}</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {reminders.map((reminder) => (
              <ReminderCard key={reminder.id} reminder={reminder} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
