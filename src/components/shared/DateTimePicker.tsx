import { FC } from 'react';
import { Input } from './Input';
import dayjs from 'dayjs';

interface DateTimePickerProps {
  label?: string;
  error?: string;
  value: string;
  onChange: (value: string) => void;
  min?: string;
}

export const DateTimePicker: FC<DateTimePickerProps> = ({ label, error, value, onChange, min }) => {
  // Default min to current datetime if not provided
  const minValue = min || dayjs().format('YYYY-MM-DDTHH:mm');

  return (
    <Input
      type="datetime-local"
      label={label}
      error={error}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      min={minValue}
    />
  );
};

interface DatePickerProps {
  label?: string;
  error?: string;
  value: string;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
}

export const DatePicker: FC<DatePickerProps> = ({ label, error, value, onChange, min, max }) => {
  // Default min to today if not provided
  const minValue = min || dayjs().format('YYYY-MM-DD');

  return (
    <Input
      type="date"
      label={label}
      error={error}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      min={minValue}
      max={max}
    />
  );
};

interface TimePickerProps {
  label?: string;
  error?: string;
  value: string;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
}

export const TimePicker: FC<TimePickerProps> = ({ label, error, value, onChange, min, max }) => {
  return (
    <Input
      type="time"
      label={label}
      error={error}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      min={min}
      max={max}
    />
  );
};
