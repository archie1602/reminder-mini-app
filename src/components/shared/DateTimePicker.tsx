import { FC } from 'react';
import { Input } from './Input';

interface DateTimePickerProps {
  label?: string;
  error?: string;
  value: string;
  onChange: (value: string) => void;
}

export const DateTimePicker: FC<DateTimePickerProps> = ({ label, error, value, onChange }) => {
  return (
    <Input
      type="datetime-local"
      label={label}
      error={error}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
};

interface DatePickerProps {
  label?: string;
  error?: string;
  value: string;
  onChange: (value: string) => void;
}

export const DatePicker: FC<DatePickerProps> = ({ label, error, value, onChange }) => {
  return (
    <Input
      type="date"
      label={label}
      error={error}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
};

interface TimePickerProps {
  label?: string;
  error?: string;
  value: string;
  onChange: (value: string) => void;
}

export const TimePicker: FC<TimePickerProps> = ({ label, error, value, onChange }) => {
  return (
    <Input
      type="time"
      label={label}
      error={error}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
};
