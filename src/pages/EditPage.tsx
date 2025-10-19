import { FC, useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createReminderSchema, CreateReminderFormData } from '@/schemas/reminder.schema';
import { useReminder, useUpdateReminder } from '@/hooks/useReminders';
import { useTelegramMainButton } from '@/hooks/useTelegramMainButton';
import { useTelegramBackButton } from '@/hooks/useTelegramBackButton';
import { Textarea } from '@/components/shared/Textarea';
import { Button } from '@/components/shared/Button';
import { Select } from '@/components/shared/Select';
import { ScheduleEditor } from '@/components/reminder/ScheduleEditor';
import { FormValidationSummary } from '@/components/shared/FormValidationSummary';
import { SkeletonForm, FadeIn } from '@/components/shared/Skeleton';
import { RuleType, ReminderState } from '@/api/types';
import { getDefaultTimezone, commonTimezones } from '@/utils/timezones';
import { hasValidationErrors } from '@/utils/formHelpers';
import { canEditReminder, isScheduleExpired } from '@/utils/reminderHelpers';
import dayjs from 'dayjs';

export const EditPage: FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: reminder, isLoading } = useReminder(id!);
  const updateMutation = useUpdateReminder();
  const [originalFormData, setOriginalFormData] = useState<CreateReminderFormData | null>(null);

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

      // Show info if expired schedules were removed
      if (reminder.status === ReminderState.Ended && schedules.length < reminder.schedules.length) {
        const removedCount = reminder.schedules.length - schedules.length;
        console.info(`Removed ${removedCount} expired schedule(s)`);
      }
    }
  }, [reminder, reset]);

  const onSubmit = async (data: CreateReminderFormData) => {
    if (!id) return;

    // Delete all old schedules and add new ones
    const oldScheduleIds = reminder?.schedules?.map((s) => s.id) || [];

    await updateMutation.mutateAsync({
      id,
      data: {
        text: data.text,
        scheduleOperations: {
          delete: oldScheduleIds.length > 0 ? oldScheduleIds : undefined,
          add: data.schedules,
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

    // Check schedules change (simplified check based on count for now)
    if (originalFormData.schedules.length !== watchedValues.schedules?.length) return true;

    // For a more thorough check, you'd compare each schedule's rule deeply
    // This is simplified for now
    return false;
  }, [originalFormData, watchedValues]);

  const hasErrors = hasValidationErrors(errors);

  useTelegramBackButton();
  useTelegramMainButton({
    text: t('common.save'),
    onClick: handleSubmit(onSubmit),
    enabled: !hasErrors && !updateMutation.isPending && hasChanges,
    visible: true,
  });

  const handleAddSchedule = () => {
    append({
      rule: {
        type: RuleType.OneTime,
        oneTime: {
          fireAt: dayjs().add(1, 'hour').format('YYYY-MM-DDTHH:mm:ss'),
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
                {t('reminder.endedEditInfo', 'This reminder has ended. Expired schedules have been removed. Adding new schedules will reactivate it.')}
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
                  options={commonTimezones}
                />
              )}
            />

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-[var(--tg-theme-text-color)]">
                  {t('reminder.schedules')}
                </h2>
                <Button variant="secondary" onClick={handleAddSchedule} className="text-sm py-1 px-3" type="button">
                  {t('common.addSchedule')}
                </Button>
              </div>

              {fields.map((field, index) => (
                <ScheduleEditor
                  key={field.id}
                  index={index}
                  control={control}
                  setValue={setValue}
                  watch={watch}
                  onRemove={() => remove(index)}
                  showRemoveButton={fields.length > 1}
                />
              ))}
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
            >
              {t('common.save')}
            </Button>
          </form>
        </div>
      </div>
    </FadeIn>
  );
};
