import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { UserReminderResponse, ReminderState } from '@/api/types';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { humanizeRule } from '@/utils/humanizeRule';
import { useDeleteReminder } from '@/hooks/useReminders';

interface ReminderCardProps {
  reminder: UserReminderResponse;
}

export const ReminderCard: FC<ReminderCardProps> = ({ reminder }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const deleteMutation = useDeleteReminder();

  const handleEdit = () => {
    navigate(`/edit/${reminder.id}`);
  };

  const handleDelete = () => {
    if (window.confirm(t('reminder.deleteConfirm'))) {
      deleteMutation.mutate(reminder.id);
    }
  };

  const schedules = reminder.schedules || [];

  return (
    <Card>
      <div className="space-y-3">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold text-[var(--tg-theme-text-color)]">
            {reminder.text}
          </h3>
          <span
            className={`px-2 py-1 rounded text-xs font-medium ${
              reminder.status === ReminderState.Active
                ? 'bg-green-500/20 text-green-600'
                : reminder.status === ReminderState.Paused
                ? 'bg-yellow-500/20 text-yellow-600'
                : reminder.status === ReminderState.Ended
                ? 'bg-red-500/20 text-red-600'
                : 'bg-gray-500/20 text-gray-600'
            }`}
          >
            {reminder.status === ReminderState.Active
              ? t('common.active')
              : reminder.status === ReminderState.Paused
              ? t('common.paused')
              : reminder.status === ReminderState.Ended
              ? t('common.ended')
              : t('common.draft')}
          </span>
        </div>

        {schedules.length > 0 && (
          <div className="space-y-2">
            {schedules.map((schedule) => (
              <div key={schedule.id} className="text-sm text-[var(--tg-theme-hint-color)] flex items-start">
                {schedules.length > 1 && (
                  <span className="text-[var(--tg-theme-text-color)] mr-2 mt-0.5">•</span>
                )}
                <span>{humanizeRule(schedule.rule, t)}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2 mt-4">
          <Button variant="secondary" onClick={handleEdit} className="flex-1">
            {t('common.edit')}
          </Button>
          <Button variant="danger" onClick={handleDelete} className="flex-1">
            {t('common.delete')}
          </Button>
        </div>
      </div>
    </Card>
  );
};
