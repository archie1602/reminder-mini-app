import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { UserReminderResponse, ReminderState } from '@/api/types';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { humanizeRule } from '@/utils/humanizeRule';
import {
  useDeleteReminder,
  usePauseReminder,
  useActivateReminder
} from '@/hooks/useReminders';
import {
  getReminderActions,
  getStatusMessage,
  getEditWarningMessage
} from '@/utils/reminderHelpers';
import { ConfirmationModal } from '@/components/modals/ConfirmationModal';
import { NextRunAt } from '@/components/reminder/NextRunAt';

interface ReminderCardProps {
  reminder: UserReminderResponse;
}

export const ReminderCard: FC<ReminderCardProps> = ({ reminder }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showEditWarning, setShowEditWarning] = useState(false);

  const deleteMutation = useDeleteReminder();
  const pauseMutation = usePauseReminder();
  const activateMutation = useActivateReminder();

  const handleEdit = () => {
    // Show warning for ENDED reminders
    if (reminder.status === ReminderState.Ended) {
      setShowEditWarning(true);
    } else {
      navigate(`/edit/${reminder.id}`);
    }
  };

  const handleDelete = () => {
    if (window.confirm(t('reminder.deleteConfirm'))) {
      deleteMutation.mutate(reminder.id);
    }
  };

  const handlePause = () => {
    pauseMutation.mutate(reminder.id);
  };

  const handleActivate = () => {
    activateMutation.mutate(reminder.id);
  };

  const handleConfirmEdit = () => {
    setShowEditWarning(false);
    navigate(`/edit/${reminder.id}`);
  };

  const schedules = reminder.schedules || [];
  const actions = getReminderActions(reminder.status);
  const statusMessage = getStatusMessage(reminder.status, t);
  const editWarningMessage = getEditWarningMessage(reminder.status, t);

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

        {reminder.status === ReminderState.Active && reminder.nextRunAt && (
          <NextRunAt nextRunAt={reminder.nextRunAt} timeZone={reminder.timeZone} />
        )}

        {statusMessage && (
          <div className="text-sm text-[var(--tg-theme-hint-color)] bg-[var(--tg-theme-bg-color)] p-2 rounded">
            {statusMessage}
          </div>
        )}

        <div className="flex gap-2 mt-4">
          {actions.map((action) => {
            const handleAction = () => {
              switch (action.type) {
                case 'edit':
                  handleEdit();
                  break;
                case 'delete':
                  handleDelete();
                  break;
                case 'pause':
                  handlePause();
                  break;
                case 'activate':
                  handleActivate();
                  break;
                default:
                  break;
              }
            };

            return (
              <Button
                key={action.type}
                variant={action.variant || 'secondary'}
                onClick={handleAction}
                className="flex-1"
              >
                {t(action.label)}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Edit warning modal for ENDED reminders */}
      <ConfirmationModal
        isOpen={showEditWarning}
        title={t('modal.editEndedReminder')}
        message={editWarningMessage || ''}
        confirmText={t('common.continue')}
        cancelText={t('common.cancel')}
        onConfirm={handleConfirmEdit}
        onCancel={() => setShowEditWarning(false)}
        variant="warning"
      />
    </Card>
  );
};
