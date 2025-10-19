import { ReminderState, ScheduleResponseDto, RuleType } from '@/api/types';

/**
 * Check if a reminder can be edited based on its status
 */
export const canEditReminder = (status: ReminderState): boolean => {
  // PAUSED reminders cannot be edited according to requirements
  return status !== ReminderState.Paused;
};

/**
 * Check if a reminder can be paused
 */
export const canPauseReminder = (status: ReminderState): boolean => {
  return status === ReminderState.Active;
};

/**
 * Check if a reminder can be activated
 */
export const canActivateReminder = (status: ReminderState): boolean => {
  return status === ReminderState.Paused;
};

/**
 * Check if a reminder can be converted to draft
 */
export const canConvertToDraft = (status: ReminderState): boolean => {
  return status === ReminderState.Ended;
};

/**
 * Check if a schedule is expired
 */
export const isScheduleExpired = (schedule: ScheduleResponseDto): boolean => {
  // If lastRunAt exists and is in the past, consider it expired
  // This is a simplified check - backend should handle the full logic
  if (schedule.lastRunAt) {
    const now = new Date();

    // For one-time rules, if they've run, they're expired
    if (schedule.rule.type === RuleType.OneTime && schedule.rule.oneTime?.fireAt) {
      const fireAt = new Date(schedule.rule.oneTime.fireAt);
      return fireAt < now;
    }

    // For other types, we'd need more complex logic
    // Let's return false for now and let backend handle it
  }
  return false;
};

/**
 * Filter out expired schedules from a reminder
 */
export const filterExpiredSchedules = (schedules: ScheduleResponseDto[]): ScheduleResponseDto[] => {
  return schedules.filter(schedule => !isScheduleExpired(schedule));
};

/**
 * Get status-specific message for reminders
 */
export const getStatusMessage = (status: ReminderState): string | null => {
  switch (status) {
    case ReminderState.Draft:
      return 'This reminder is a draft. Add schedules to activate it.';
    case ReminderState.Paused:
      return 'This reminder is paused and cannot be edited. Activate it first to make changes.';
    case ReminderState.Ended:
      return 'This reminder has ended. You can edit it to create new schedules.';
    default:
      return null;
  }
};

/**
 * Get the appropriate action buttons for a reminder based on its status
 */
export interface ReminderAction {
  type: 'edit' | 'delete' | 'pause' | 'activate' | 'convertToDraft';
  label: string;
  variant?: 'primary' | 'danger' | 'secondary';
}

export const getReminderActions = (status: ReminderState): ReminderAction[] => {
  const actions: ReminderAction[] = [];

  switch (status) {
    case ReminderState.Draft:
      actions.push({ type: 'edit', label: 'common.edit' });
      actions.push({ type: 'delete', label: 'common.delete', variant: 'danger' });
      break;
    case ReminderState.Active:
      actions.push({ type: 'edit', label: 'common.edit' });
      actions.push({ type: 'pause', label: 'common.pause', variant: 'secondary' });
      actions.push({ type: 'delete', label: 'common.delete', variant: 'danger' });
      break;
    case ReminderState.Paused:
      actions.push({ type: 'activate', label: 'common.activate', variant: 'primary' });
      actions.push({ type: 'delete', label: 'common.delete', variant: 'danger' });
      break;
    case ReminderState.Ended:
      actions.push({ type: 'edit', label: 'common.edit' });
      actions.push({ type: 'delete', label: 'common.delete', variant: 'danger' });
      break;
  }

  return actions;
};

/**
 * Check if form has changes compared to original data
 */
export const hasFormChanges = (
  original: { text: string; schedules: ScheduleResponseDto[] },
  current: { text: string; schedules: ScheduleResponseDto[] }
): boolean => {
  // Check text change
  if (original.text !== current.text) {
    return true;
  }

  // Check schedule changes (simplified - in real app would need deeper comparison)
  if (original.schedules.length !== current.schedules.length) {
    return true;
  }

  // For now, any schedule modification counts as a change
  // In production, you'd want to do a deep comparison of schedule rules
  return false;
};

/**
 * Get a human-readable description of what will happen when editing a reminder
 */
export const getEditWarningMessage = (status: ReminderState): string | null => {
  if (status === ReminderState.Ended) {
    return `Editing will delete all expired schedules.
If you don't add new schedules, this reminder will become a Draft.
If you add new schedules, it will become Active.`;
  }
  return null;
};