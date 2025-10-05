import { FC, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createReminderSchema, CreateReminderFormData } from '@/schemas/reminder.schema';
import { useReminder, useUpdateReminder } from '@/hooks/useReminders';
import { useTelegramMainButton } from '@/hooks/useTelegramMainButton';
import { useTelegramBackButton } from '@/hooks/useTelegramBackButton';
import { Textarea } from '@/components/shared/Textarea';
import { Button } from '@/components/shared/Button';
import { Select } from '@/components/shared/Select';
import { Segmented } from '@/components/shared/Segmented';
import { OneTimeRuleEditor } from '@/components/rules/OneTimeRuleEditor';
import { IntervalRuleEditor } from '@/components/rules/IntervalRuleEditor';
import { ComplexRuleEditor } from '@/components/rules/ComplexRuleEditor';
import { SkeletonForm, FadeIn } from '@/components/shared/Skeleton';
import { RuleType, RuleDateMode, RuleTimeMode, TimeUnit } from '@/api/types';
import { commonTimezones, getDefaultTimezone } from '@/utils/timezones';

export const EditPage: FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: reminder, isLoading } = useReminder(id!);
  const updateMutation = useUpdateReminder();

  const [ruleType, setRuleType] = useState<RuleType>(RuleType.OneTime);
  const [timezone, setTimezone] = useState(getDefaultTimezone());

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
    reset,
  } = useForm<CreateReminderFormData>({
    resolver: zodResolver(createReminderSchema),
    mode: 'onChange',
  });

  // Initialize form with existing reminder data
  useEffect(() => {
    if (reminder && reminder.schedules && reminder.schedules.length > 0) {
      const schedule = reminder.schedules[0];
      setRuleType(schedule.type);

      reset({
        text: reminder.text || '',
        schedules: [
          {
            type: schedule.type,
            timeZone: timezone,
            rule: schedule.rule,
          },
        ],
      });
    }
  }, [reminder, reset]);

  const onSubmit = async (data: CreateReminderFormData) => {
    if (!id) return;

    // For update, we delete old schedule and add new one
    const oldScheduleId = reminder?.schedules?.[0]?.id;

    await updateMutation.mutateAsync({
      id,
      data: {
        text: data.text,
        scheduleOperations: {
          delete: oldScheduleId ? [oldScheduleId] : undefined,
          add: data.schedules,
        },
      },
    });

    navigate('/');
  };

  useTelegramBackButton();
  useTelegramMainButton({
    text: t('common.save'),
    onClick: handleSubmit(onSubmit),
    enabled: isValid && !updateMutation.isPending,
    visible: true,
  });

  const handleRuleTypeChange = (newType: string) => {
    const type = newType as RuleType;
    setRuleType(type);

    let newRule;
    switch (type) {
      case RuleType.OneTime:
        newRule = {
          type: RuleType.OneTime,
          oneTime: { fireAt: new Date().toISOString() },
        };
        break;
      case RuleType.Interval:
        newRule = {
          type: RuleType.Interval,
          interval: { every: 1, unit: TimeUnit.Hours },
        };
        break;
      case RuleType.Complex:
        newRule = {
          type: RuleType.Complex,
          complex: {
            date: { mode: RuleDateMode.Daily },
            time: { mode: RuleTimeMode.ExactTime, at: '09:00:00' },
          },
        };
        break;
    }

    setValue('schedules.0.rule', newRule, { shouldValidate: true });
    setValue('schedules.0.type', type, { shouldValidate: true });
  };

  const currentRule = watch('schedules.0.rule');

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

            <Segmented
              label={t('rule.type')}
              options={[
                { value: RuleType.OneTime, label: t('rule.oneTime') },
                { value: RuleType.Interval, label: t('rule.interval') },
                { value: RuleType.Complex, label: t('rule.complex') },
              ]}
              value={ruleType}
              onChange={handleRuleTypeChange}
            />

            {currentRule && ruleType === RuleType.OneTime && currentRule.oneTime && (
              <OneTimeRuleEditor
                value={currentRule.oneTime}
                onChange={(oneTime) =>
                  setValue('schedules.0.rule.oneTime', oneTime, { shouldValidate: true })
                }
              />
            )}

            {currentRule && ruleType === RuleType.Interval && currentRule.interval && (
              <IntervalRuleEditor
                value={currentRule.interval}
                onChange={(interval) =>
                  setValue('schedules.0.rule.interval', interval, { shouldValidate: true })
                }
              />
            )}

            {currentRule && ruleType === RuleType.Complex && currentRule.complex && (
              <ComplexRuleEditor
                value={currentRule.complex}
                onChange={(complex) =>
                  setValue('schedules.0.rule.complex', complex, { shouldValidate: true })
                }
              />
            )}

            <Select
              label={t('reminder.timezone')}
              options={commonTimezones}
              value={timezone}
              onChange={(e) => {
                setTimezone(e.target.value);
                setValue('schedules.0.timeZone', e.target.value);
              }}
            />

            <Button
              onClick={handleSubmit(onSubmit)}
              disabled={!isValid || updateMutation.isPending}
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
