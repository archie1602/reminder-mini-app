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

  return (
    <div className="space-y-4">
      <Input
        type="number"
        label={t('rule.every')}
        value={value.every}
        onChange={(e) => onChange({ ...value, every: parseInt(e.target.value) || 1 })}
        min={1}
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
