import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/shared/Input';
import { Select } from '@/components/shared/Select';
import { RuleInterval, TimeUnit } from '@/api/types';

interface IntervalRuleEditorProps {
  value: RuleInterval;
  onChange: (value: RuleInterval) => void;
}

export const IntervalRuleEditor: FC<IntervalRuleEditorProps> = ({ value, onChange }) => {
  const { t } = useTranslation();

  const timeUnitOptions = [
    { value: TimeUnit.Minutes, label: t('timeUnit.MINUTES') },
    { value: TimeUnit.Hours, label: t('timeUnit.HOURS') },
    { value: TimeUnit.Days, label: t('timeUnit.DAYS') },
  ];

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const numValue = parseInt(e.target.value);
    // Enforce minimum value of 1 when user leaves the field
    if (isNaN(numValue) || numValue < 1) {
      onChange({ ...value, every: 1 });
    }
  };

  return (
    <div className="space-y-4">
      <Input
        type="number"
        label={t('rule.every')}
        value={value.every === 0 ? '' : value.every}
        onChange={(e) => {
          const inputValue = e.target.value;
          if (inputValue === '') {
            // Allow empty input during typing
            onChange({ ...value, every: 0 });
          } else {
            const numValue = parseInt(inputValue);
            onChange({ ...value, every: isNaN(numValue) ? 0 : numValue });
          }
        }}
        onBlur={handleBlur}
      />
      <Select
        label={t('rule.unit')}
        options={timeUnitOptions}
        value={value.unit}
        onChange={(e) => onChange({ ...value, unit: e.target.value as TimeUnit })}
      />
    </div>
  );
};
