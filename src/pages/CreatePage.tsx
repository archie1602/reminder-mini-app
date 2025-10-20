import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createReminderSchema, CreateReminderFormData } from '@/schemas/reminder.schema';
import { useCreateReminder } from '@/hooks/useReminders';
import { useTelegramMainButton } from '@/hooks/useTelegramMainButton';
import { useTelegramBackButton } from '@/hooks/useTelegramBackButton';
import { Textarea } from '@/components/shared/Textarea';
import { Button } from '@/components/shared/Button';
import { Select } from '@/components/shared/Select';
import { ScheduleEditor } from '@/components/reminder/ScheduleEditor';
import { NoSchedulesMessage } from '@/components/reminder/NoSchedulesMessage';
import { FormValidationSummary } from '@/components/shared/FormValidationSummary';
import { RuleType } from '@/api/types';
import { getDefaultTimezone, commonTimezones } from '@/utils/timezones';
import { hasValidationErrors } from '@/utils/formHelpers';
import dayjs from 'dayjs';

export const CreatePage: FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const createMutation = useCreateReminder();

  const {
    control,
    handleSubmit,
    formState: { errors },
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

  useTelegramBackButton();
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
                timezone={watch('timeZone') || getDefaultTimezone()}
              />
            ))}

            {fields.length === 0 && <NoSchedulesMessage />}
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
};
