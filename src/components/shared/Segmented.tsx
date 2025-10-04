import { FC } from 'react';

interface SegmentedOption {
  value: string;
  label: string;
}

interface SegmentedProps {
  options: SegmentedOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

export const Segmented: FC<SegmentedProps> = ({ options, value, onChange, label }) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-[var(--tg-theme-text-color)] mb-2">
          {label}
        </label>
      )}
      <div className="inline-flex rounded-lg bg-[var(--tg-theme-secondary-bg-color)] p-1 w-full">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              value === option.value
                ? 'bg-[var(--tg-theme-button-color)] text-[var(--tg-theme-button-text-color)]'
                : 'text-[var(--tg-theme-text-color)] hover:bg-[var(--tg-theme-bg-color)]'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};
