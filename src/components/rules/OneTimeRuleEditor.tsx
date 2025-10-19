import { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { DateTimePicker } from '@/components/shared/DateTimePicker';
import { RuleOneTime } from '@/api/types';
import dayjs from 'dayjs';

interface OneTimeRuleEditorProps {
  value: RuleOneTime;
  onChange: (value: RuleOneTime) => void;
}

export const OneTimeRuleEditor: FC<OneTimeRuleEditorProps> = ({ value, onChange }) => {
  const { t } = useTranslation();

  const handleDateTimeChange = (datetime: string) => {
    // Format as ISO datetime without Z suffix
    const isoDateTime = dayjs(datetime).format('YYYY-MM-DDTHH:mm:ss');
    onChange({ fireAt: isoDateTime });
  };

  // Convert ISO to datetime-local format
  const localDateTime = value.fireAt ? dayjs(value.fireAt).format('YYYY-MM-DDTHH:mm') : '';

  // Check if the selected date is in the past
  const error = useMemo(() => {
    if (value.fireAt && dayjs(value.fireAt).isBefore(dayjs())) {
      return t('validation.futureDateTime');
    }
    return undefined;
  }, [value.fireAt, t]);

  return (
    <div className="space-y-4">
      <DateTimePicker
        label={t('rule.fireAt')}
        value={localDateTime}
        onChange={handleDateTimeChange}
        error={error}
      />
    </div>
  );
};
