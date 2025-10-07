import { FC, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Control, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { CreateReminderFormData } from '@/schemas/reminder.schema';
import { Select } from '@/components/shared/Select';
import { Segmented } from '@/components/shared/Segmented';
import { Button } from '@/components/shared/Button';
import { OneTimeRuleEditor } from '@/components/rules/OneTimeRuleEditor';
import { IntervalRuleEditor } from '@/components/rules/IntervalRuleEditor';
import { ComplexRuleEditor } from '@/components/rules/ComplexRuleEditor';
import { RuleType, RuleDateMode, RuleTimeMode, TimeUnit } from '@/api/types';
import { commonTimezones, getDefaultTimezone } from '@/utils/timezones';
import dayjs from 'dayjs';

interface ScheduleEditorProps {
  index: number;
  control: Control<CreateReminderFormData>;
  setValue: UseFormSetValue<CreateReminderFormData>;
  watch: UseFormWatch<CreateReminderFormData>;
  onRemove?: () => void;
  showRemoveButton?: boolean;
}

export const ScheduleEditor: FC<ScheduleEditorProps> = ({
  index,
  setValue,
  watch,
  onRemove,
  showRemoveButton = false,
}) => {
  const { t } = useTranslation();
  const [ruleType, setRuleType] = useState<RuleType>(RuleType.OneTime);
  const [timezone, setTimezone] = useState(getDefaultTimezone());

  const currentRule = watch(`schedules.${index}.rule`);

  useEffect(() => {
    if (currentRule?.type) {
      setRuleType(currentRule.type);
    }
  }, [currentRule?.type]);

  useEffect(() => {
    const currentTimezone = watch(`schedules.${index}.timeZone`);
    if (currentTimezone) {
      setTimezone(currentTimezone);
    }
  }, [watch, index]);

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

    setValue(`schedules.${index}.rule`, newRule, { shouldValidate: true });
  };

  const handleRemove = () => {
    if (window.confirm(t('reminder.removeScheduleConfirm'))) {
      onRemove?.();
    }
  };

  return (
    <div className="border border-[var(--tg-theme-hint-color)]/20 rounded-lg p-4 space-y-4">
      {showRemoveButton && (
        <div className="flex justify-end">
          <Button variant="danger" onClick={handleRemove} className="text-sm py-1 px-3" type="button">
            {t('common.remove')}
          </Button>
        </div>
      )}

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
            setValue(`schedules.${index}.rule.oneTime`, oneTime, { shouldValidate: true })
          }
        />
      )}

      {currentRule && ruleType === RuleType.Interval && currentRule.interval && (
        <IntervalRuleEditor
          value={currentRule.interval}
          onChange={(interval) =>
            setValue(`schedules.${index}.rule.interval`, interval, { shouldValidate: true })
          }
        />
      )}

      {currentRule && ruleType === RuleType.Complex && currentRule.complex && (
        <ComplexRuleEditor
          value={currentRule.complex}
          onChange={(complex) =>
            setValue(`schedules.${index}.rule.complex`, complex, { shouldValidate: true })
          }
        />
      )}

      <Select
        label={t('reminder.timezone')}
        options={commonTimezones}
        value={timezone}
        onChange={(e) => {
          setTimezone(e.target.value);
          setValue(`schedules.${index}.timeZone`, e.target.value);
        }}
      />
    </div>
  );
};
