import { FC, useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createReminderSchema, CreateReminderFormData } from '@/schemas/reminder.schema';
import { useReminder, useUpdateReminder } from '@/hooks/useReminders';
import { useTelegramMainButton } from '@/hooks/useTelegramMainButton';
import { useTelegramBackButton } from '@/hooks/useTelegramBackButton';
import { useUnsavedChangesWarning } from '@/hooks/useUnsavedChangesWarning';
import { closingBehavior } from '@telegram-apps/sdk-react';
import { Textarea } from '@/components/shared/Textarea';
import { Button } from '@/components/shared/Button';
import { Select } from '@/components/shared/Select';
import { ScheduleEditor } from '@/components/reminder/ScheduleEditor';
import { NoSchedulesMessage } from '@/components/reminder/NoSchedulesMessage';
import { FormValidationSummary } from '@/components/shared/FormValidationSummary';
import { SkeletonForm, FadeIn } from '@/components/shared/Skeleton';
import { RuleType, ReminderState } from '@/api/types';
import { getDefaultTimezone, allTimezones } from '@/utils/timezones';
import { hasValidationErrors } from '@/utils/formHelpers';
import { canEditReminder, isScheduleExpired } from '@/utils/reminderHelpers';
import dayjs from 'dayjs';

const MAX_SCHEDULES = 5;

export const EditPage: FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: reminder, isLoading } = useReminder(id!);
  const updateMutation = useUpdateReminder();
  const [originalFormData, setOriginalFormData] = useState<CreateReminderFormData | null>(null);
  const [originalScheduleIds, setOriginalScheduleIds] = useState<string[]>([]);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<CreateReminderFormData>({
    resolver: zodResolver(createReminderSchema),
    mode: 'onChange',
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'schedules',
  });

  // Check if reminder can be edited
  useEffect(() => {
    if (reminder && !canEditReminder(reminder.status)) {
      // PAUSED reminders cannot be edited
      if (reminder.status === ReminderState.Paused) {
        alert(t('reminder.pausedCannotEdit'));
        navigate('/');
      }
    }
  }, [reminder, navigate, t]);

  // Initialize form with existing reminder data
  useEffect(() => {
    if (reminder && reminder.schedules) {
      // Filter out expired schedules for ENDED reminders
      const schedules = reminder.status === ReminderState.Ended
        ? reminder.schedules.filter(s => !isScheduleExpired(s))
        : reminder.schedules;

      const formData: CreateReminderFormData = {
        text: reminder.text || '',
        timeZone: reminder.timeZone || getDefaultTimezone(),
        schedules: schedules.map((schedule) => ({
          rule: schedule.rule,
        })),
      };

      reset(formData);
      setOriginalFormData(formData);
      // Store the original schedule IDs in the same order as the form data
      setOriginalScheduleIds(schedules.map((s) => s.id));

      // Show info if expired schedules were removed
      if (reminder.status === ReminderState.Ended && schedules.length < reminder.schedules.length) {
        const removedCount = reminder.schedules.length - schedules.length;
        console.info(`Removed ${removedCount} expired schedule(s)`);
      }
    }
  }, [reminder, reset]);

  const onSubmit = async (data: CreateReminderFormData) => {
    if (!id || !originalFormData) return;

    // Determine which schedules were added, removed, or modified
    const schedulesToDelete: string[] = [];
    const schedulesToAdd: typeof data.schedules = [];

    // Compare current schedules with original schedules
    const currentSchedules = data.schedules || [];
    const originalSchedules = originalFormData.schedules || [];

    // Check for removed or modified schedules
    originalSchedules.forEach((originalSchedule, index) => {
      const currentSchedule = currentSchedules[index];
      const scheduleId = originalScheduleIds[index];

      if (!currentSchedule) {
        // Schedule was removed
        if (scheduleId) {
          schedulesToDelete.push(scheduleId);
        }
      } else {
        // Check if schedule was modified
        const isModified = JSON.stringify(originalSchedule.rule) !== JSON.stringify(currentSchedule.rule);
        if (isModified && scheduleId) {
          // Schedule was modified: delete old and add new
          schedulesToDelete.push(scheduleId);
          schedulesToAdd.push(currentSchedule);
        }
      }
    });

    // Check for newly added schedules (schedules beyond the original count)
    if (currentSchedules.length > originalSchedules.length) {
      const newSchedules = currentSchedules.slice(originalSchedules.length);
      schedulesToAdd.push(...newSchedules);
    }

    await updateMutation.mutateAsync({
      id,
      data: {
        text: data.text,
        scheduleOperations: {
          delete: schedulesToDelete.length > 0 ? schedulesToDelete : undefined,
          add: schedulesToAdd.length > 0 ? schedulesToAdd : undefined,
        },
      },
    });

    navigate('/');
  };

  const watchedValues = watch();

  // Calculate if there are actual changes
  const hasChanges = useMemo(() => {
    if (!originalFormData || !watchedValues) return false;

    // Check text change
    if (originalFormData.text !== watchedValues.text) return true;

    // Check schedules change - deep comparison
    if (originalFormData.schedules.length !== watchedValues.schedules?.length) return true;

    // Deep compare each schedule's rule
    for (let i = 0; i < originalFormData.schedules.length; i++) {
      const originalSchedule = originalFormData.schedules[i];
      const currentSchedule = watchedValues.schedules?.[i];

      if (!currentSchedule) return true;

      // Compare using JSON.stringify for deep equality
      if (JSON.stringify(originalSchedule.rule) !== JSON.stringify(currentSchedule.rule)) {
        return true;
      }
    }

    return false;
  }, [originalFormData, watchedValues]);

  const hasErrors = hasValidationErrors(errors);

  // Use unsaved changes warning hook - only show for actual unsaved changes
  const handleBackWithConfirmation = useUnsavedChangesWarning({
    hasUnsavedChanges: hasChanges,
    onBackClick: () => navigate('/'),
  });

  // Enable/disable closing confirmation based on unsaved changes
  useEffect(() => {
    if (!closingBehavior.mount.isAvailable()) return;

    // Mount if not already mounted
    if (!closingBehavior.isMounted()) {
      closingBehavior.mount();
    }

    if (hasChanges) {
      if (closingBehavior.enableConfirmation.isAvailable()) {
        closingBehavior.enableConfirmation();
      }
    } else {
      if (closingBehavior.disableConfirmation.isAvailable()) {
        closingBehavior.disableConfirmation();
      }
    }

    // Cleanup: disable confirmation when leaving the page
    return () => {
      if (closingBehavior.disableConfirmation.isAvailable()) {
        closingBehavior.disableConfirmation();
      }
    };
  }, [hasChanges]);

  useTelegramBackButton(handleBackWithConfirmation);
  useTelegramMainButton({
    text: t('common.save'),
    onClick: handleSubmit(onSubmit),
    enabled: !hasErrors && !updateMutation.isPending && hasChanges,
    visible: true,
  });

  const handleAddSchedule = () => {
    // Get the current timezone from the form
    const currentTimezone = watch('timeZone') || getDefaultTimezone();
    // Get current time + 1 hour in the reminder's timezone, but store as timezone-agnostic string
    const fireAt = dayjs().tz(currentTimezone).add(1, 'hour').format('YYYY-MM-DDTHH:mm:ss');

    append({
      rule: {
        type: RuleType.OneTime,
        oneTime: {
          fireAt,
        },
      },
    });
  };

  if (isLoading || !reminder) {
    return (
      <div className="min-h-screen bg-[var(--tg-theme-bg-color)] p-4 pb-20">
        <div className="max-w-2xl mx-auto">
          <SkeletonForm />
        </div>
      </div>
    );
  }

  return (
    <FadeIn>
      <div className="min-h-screen bg-[var(--tg-theme-bg-color)] p-4 pb-20">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-[var(--tg-theme-text-color)] mb-6">
            {t('reminder.editTitle')}
          </h1>

          {reminder.status === ReminderState.Ended && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-600 dark:text-yellow-400 p-3 rounded-lg mb-4">
              <p className="text-sm">
                {t('reminder.endedEditInfo')}
              </p>
            </div>
          )}

          <form className="space-y-6">
            <Controller
              name="text"
              control={control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  label={t('reminder.text')}
                  placeholder={t('reminder.textPlaceholder')}
                  error={errors.text?.message ? t(errors.text.message) : undefined}
                  rows={3}
                />
              )}
            />

            <Controller
              name="timeZone"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  value={field.value || ''}
                  label={t('reminder.timezone')}
                  options={allTimezones()}
                  searchable={true}
                  disabled={true}
                />
              )}
            />

            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-[var(--tg-theme-text-color)]">
                {t('reminder.schedules')}
              </h2>

              {fields.length === 0 && <NoSchedulesMessage />}

              {fields.map((field, index) => (
                <ScheduleEditor
                  key={field.id}
                  index={index}
                  control={control}
                  setValue={setValue}
                  watch={watch}
                  onRemove={() => remove(index)}
                  timezone={watch('timeZone') || getDefaultTimezone()}
                  isNew={index === fields.length - 1}
                  hasError={!!errors.schedules?.[index]}
                />
              ))}

              {fields.length < MAX_SCHEDULES ? (
                <Button variant="secondary" onClick={handleAddSchedule} className="text-sm py-2 px-4 w-full" type="button">
                  {t('common.addSchedule')}
                </Button>
              ) : (
                <div className="text-sm text-[var(--tg-theme-hint-color)] text-center py-2">
                  ℹ️ {t('reminder.maxSchedulesReached')}
                </div>
              )}
            </div>

            <FormValidationSummary errors={errors} isVisible={hasErrors} />

            {!hasChanges && !hasErrors && (
              <div className="text-sm text-[var(--tg-theme-hint-color)] text-center">
                {t('reminder.noChangesDetected')}
              </div>
            )}

            <Button
              onClick={() => {
                if (!hasChanges) {
                  alert(t('reminder.noChangesDetected'));
                } else {
                  handleSubmit(onSubmit)();
                }
              }}
              disabled={hasErrors || updateMutation.isPending || !hasChanges}
              fullWidth
              title={!hasChanges ? t('reminder.noChangesDetected') : undefined}
            >
              {t('common.save')}
            </Button>
          </form>
        </div>
      </div>
    </FadeIn>
  );
};
