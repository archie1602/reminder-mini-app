import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { GetReminderDto, ReminderStatus } from '@/api/types';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { humanizeRule } from '@/utils/humanizeRule';
import { useDeleteReminder } from '@/hooks/useReminders';

interface ReminderCardProps {
  reminder: GetReminderDto;
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

  const schedule = reminder.schedules?.[0];
  const ruleSummary = schedule ? humanizeRule(schedule.rule, t) : '';

  return (
    <Card>
      <div className="space-y-3">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold text-[var(--tg-theme-text-color)]">
            {reminder.text}
          </h3>
          <span
            className={`px-2 py-1 rounded text-xs font-medium ${
              reminder.status === ReminderStatus.Active
                ? 'bg-green-500/20 text-green-600'
                : 'bg-gray-500/20 text-gray-600'
            }`}
          >
            {reminder.status === ReminderStatus.Active ? t('common.active') : t('common.inactive')}
          </span>
        </div>

        {ruleSummary && (
          <p className="text-sm text-[var(--tg-theme-hint-color)]">{ruleSummary}</p>
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
