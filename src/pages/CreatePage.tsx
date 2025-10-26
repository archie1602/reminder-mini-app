import { useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Info } from 'lucide-react';
import { createReminderSchema, CreateReminderFormData } from '@/schemas/reminder.schema';
import { useCreateReminder } from '@/hooks/useReminders';
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
import { RuleType } from '@/api/types';
import { getDefaultTimezone, allTimezones } from '@/utils/timezones';
import { hasValidationErrors } from '@/utils/formHelpers';
import dayjs from 'dayjs';

const MAX_SCHEDULES = 5;

export default function CreatePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const createMutation = useCreateReminder();

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    setValue,
    watch,
  } = useForm<CreateReminderFormData>({
    resolver: zodResolver(createReminderSchema),
    mode: 'onChange',
    defaultValues: {
      text: '',
      timeZone: getDefaultTimezone(),
      schedules: [], // Start with no schedules to allow DRAFT creation
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'schedules',
  });

  const onSubmit = async (data: CreateReminderFormData) => {
    await createMutation.mutateAsync(data);
    navigate('/');
  };

  const hasErrors = hasValidationErrors(errors);

  const watchedSchedules = watch('schedules') || [];
  const isDraft = watchedSchedules.length === 0;

  // Check for unsaved changes
  const hasUnsavedChanges = useMemo(() => {
    return isDirty;
  }, [isDirty]);

  // Use unsaved changes warning hook - returns a callback with confirmation
  const handleBackWithConfirmation = useUnsavedChangesWarning({
    hasUnsavedChanges,
    onBackClick: () => navigate('/'),
  });

  // Enable/disable closing confirmation based on unsaved changes
  useEffect(() => {
    if (!closingBehavior.mount.isAvailable()) return;

    // Mount if not already mounted
    if (!closingBehavior.isMounted()) {
      closingBehavior.mount();
    }

    if (hasUnsavedChanges) {
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
  }, [hasUnsavedChanges]);

  useTelegramBackButton(handleBackWithConfirmation);
  useTelegramMainButton({
    text: isDraft ? t('reminder.saveAsDraft') : t('common.save'),
    onClick: handleSubmit(onSubmit),
    enabled: !hasErrors && !createMutation.isPending,
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

  // Get timezone options (memoized)
  const timezoneOptions = useMemo(() => {
    return allTimezones();
  }, []);

  return (
    <div className="min-h-screen bg-[var(--tg-theme-bg-color)] p-4 pb-20">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-[var(--tg-theme-text-color)] mb-6">
          {t('reminder.createTitle')}
        </h1>

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
                options={timezoneOptions}
                searchable={true}
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
              <div className="text-sm text-[var(--tg-theme-hint-color)] text-center py-2 flex items-center justify-center gap-1">
                <Info size={16} className="inline-block" /> {t('reminder.maxSchedulesReached')}
              </div>
            )}
          </div>

          <FormValidationSummary errors={errors} isVisible={hasErrors} />

          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={hasErrors || createMutation.isPending}
            fullWidth
          >
            {isDraft ? t('reminder.saveAsDraft') : t('common.save')}
          </Button>
        </form>
      </div>
    </div>
  );
}
