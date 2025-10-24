import { useState, useEffect, forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Control, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { Trash2 } from 'lucide-react';
import { CreateReminderFormData } from '@/schemas/reminder.schema';
import { Segmented } from '@/components/shared/Segmented';
import { Button } from '@/components/shared/Button';
import { OneTimeRuleEditor } from '@/components/rules/OneTimeRuleEditor';
import { IntervalRuleEditor } from '@/components/rules/IntervalRuleEditor';
import { ComplexRuleEditor } from '@/components/rules/ComplexRuleEditor';
import { RuleType, RuleDateMode, RuleTimeMode, TimeUnit } from '@/api/types';
import dayjs from 'dayjs';

interface ScheduleEditorProps {
  index: number;
  control: Control<CreateReminderFormData>;
  setValue: UseFormSetValue<CreateReminderFormData>;
  watch: UseFormWatch<CreateReminderFormData>;
  onRemove?: () => void;
  timezone: string;
  isNew?: boolean;
  hasError?: boolean;
}

export const ScheduleEditor = forwardRef<HTMLDivElement, ScheduleEditorProps>(({
  index,
  setValue,
  watch,
  onRemove,
  timezone,
  isNew = false,
  hasError = false,
}, ref) => {
  const { t } = useTranslation();
  const [ruleType, setRuleType] = useState<RuleType>(RuleType.OneTime);
  const [isDeleting, setIsDeleting] = useState(false);

  const currentRule = watch(`schedules.${index}.rule`);

  useEffect(() => {
    if (currentRule?.type) {
      setRuleType(currentRule.type);
    }
  }, [currentRule?.type]);

  const handleRuleTypeChange = (newType: string) => {
    const type = newType as RuleType;
    setRuleType(type);

    let newRule;
    switch (type) {
      case RuleType.OneTime:
        // Get current time + 1 hour in the reminder's timezone, but store as timezone-agnostic string
        const fireAt = dayjs().tz(timezone).add(1, 'hour').format('YYYY-MM-DDTHH:mm:ss');
        newRule = {
          type: RuleType.OneTime,
          oneTime: { fireAt },
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
      setIsDeleting(true);
      // Wait for animation to complete before actually removing
      setTimeout(() => {
        onRemove?.();
      }, 300); // Match animation duration
    }
  };

  return (
    <div
      ref={ref}
      className={`border rounded-lg p-4 space-y-4 ${
        hasError
          ? 'border-red-500 bg-red-500/5'
          : 'border-[var(--tg-theme-hint-color)]/20'
      } ${
        isDeleting ? 'overflow-hidden' : ''
      } ${
        isNew ? 'animate-[fadeSlideIn_0.4s_ease-out]' : ''
      } ${
        isDeleting ? 'animate-[fadeSlideOut_0.3s_ease-in_forwards]' : ''
      }`}
    >
      {onRemove && (
        <div className="flex justify-end">
          <Button variant="danger" onClick={handleRemove} className="text-sm py-1 px-3" type="button">
            <Trash2 size={18} />
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
          timezone={timezone}
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
          timezone={timezone}
        />
      )}
    </div>
  );
});

ScheduleEditor.displayName = 'ScheduleEditor';
