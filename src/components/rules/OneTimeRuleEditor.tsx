import { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { DateTimePicker } from '@/components/shared/DateTimePicker';
import { RuleOneTime } from '@/api/types';
import dayjs from 'dayjs';

interface OneTimeRuleEditorProps {
  value: RuleOneTime;
  onChange: (value: RuleOneTime) => void;
  timezone: string;
}

export const OneTimeRuleEditor: FC<OneTimeRuleEditorProps> = ({ value, onChange, timezone }) => {
  const { t } = useTranslation();

  const handleDateTimeChange = (datetime: string) => {
    // datetime-local format: "2025-10-19T17:40"
    // Store it directly with seconds appended, no timezone conversion
    const isoDateTime = datetime ? `${datetime}:00` : '';
    onChange({ fireAt: isoDateTime });
  };

  // Display the stored datetime directly without any timezone conversion
  // Just strip the seconds: "2025-10-19T17:40:00" -> "2025-10-19T17:40"
  const localDateTime = value.fireAt
    ? value.fireAt.substring(0, 16) // Take only YYYY-MM-DDTHH:mm part
    : '';

  // For validation, interpret the stored datetime as being in the reminder's timezone
  const error = useMemo(() => {
    if (value.fireAt) {
      // Parse the stored datetime string as if it's in the reminder's timezone
      const fireAtInTimezone = dayjs.tz(value.fireAt, timezone);
      const nowInTimezone = dayjs().tz(timezone);

      if (fireAtInTimezone.isBefore(nowInTimezone)) {
        return t('validation.futureDateTime');
      }
    }
    return undefined;
  }, [value.fireAt, t, timezone]);

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
