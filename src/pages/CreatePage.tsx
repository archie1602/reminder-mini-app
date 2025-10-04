import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createReminderSchema, CreateReminderFormData } from '@/schemas/reminder.schema';
import { useCreateReminder } from '@/hooks/useReminders';
import { useTelegramMainButton } from '@/hooks/useTelegramMainButton';
import { useTelegramBackButton } from '@/hooks/useTelegramBackButton';
import { Textarea } from '@/components/shared/Textarea';
import { Button } from '@/components/shared/Button';
import { Select } from '@/components/shared/Select';
import { Segmented } from '@/components/shared/Segmented';
import { OneTimeRuleEditor } from '@/components/rules/OneTimeRuleEditor';
import { IntervalRuleEditor } from '@/components/rules/IntervalRuleEditor';
import { ComplexRuleEditor } from '@/components/rules/ComplexRuleEditor';
import { RuleType, RuleDateMode, RuleTimeMode, TimeUnit } from '@/api/types';
import { commonTimezones, getDefaultTimezone } from '@/utils/timezones';
import dayjs from 'dayjs';

export const CreatePage: FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const createMutation = useCreateReminder();

  const [ruleType, setRuleType] = useState<RuleType>(RuleType.OneTime);
  const [timezone, setTimezone] = useState(getDefaultTimezone());

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
  } = useForm<CreateReminderFormData>({
    resolver: zodResolver(createReminderSchema),
    mode: 'onChange',
    defaultValues: {
      text: '',
      schedules: [
        {
          type: RuleType.OneTime,
          timeZone: timezone,
          rule: {
            type: RuleType.OneTime,
            oneTime: {
              fireAt: dayjs().add(1, 'hour').toISOString(),
            },
          },
        },
      ],
    },
  });

  const onSubmit = async (data: CreateReminderFormData) => {
    await createMutation.mutateAsync(data);
    navigate('/');
  };

  useTelegramBackButton();
  useTelegramMainButton({
    text: t('common.save'),
    onClick: handleSubmit(onSubmit),
    enabled: isValid && !createMutation.isPending,
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
          oneTime: { fireAt: dayjs().add(1, 'hour').toISOString() },
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

          {ruleType === RuleType.OneTime && currentRule.oneTime && (
            <OneTimeRuleEditor
              value={currentRule.oneTime}
              onChange={(oneTime) =>
                setValue('schedules.0.rule.oneTime', oneTime, { shouldValidate: true })
              }
            />
          )}

          {ruleType === RuleType.Interval && currentRule.interval && (
            <IntervalRuleEditor
              value={currentRule.interval}
              onChange={(interval) =>
                setValue('schedules.0.rule.interval', interval, { shouldValidate: true })
              }
            />
          )}

          {ruleType === RuleType.Complex && currentRule.complex && (
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
            disabled={!isValid || createMutation.isPending}
            fullWidth
          >
            {t('common.save')}
          </Button>
        </form>
      </div>
    </div>
  );
};
