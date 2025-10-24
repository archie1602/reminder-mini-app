import { FC } from 'react';

interface MultiSelectOption {
  value: number;
  label: string;
}

interface MultiSelectProps {
  label?: string;
  options: MultiSelectOption[];
  value: number[];
  onChange: (value: number[]) => void;
  gridColumns?: number;
}

export const MultiSelect: FC<MultiSelectProps> = ({ label, options, value, onChange, gridColumns = 7 }) => {
  const toggleOption = (optionValue: number) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-[var(--tg-theme-text-color)] mb-2">
          {label}
        </label>
      )}
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${gridColumns}, minmax(0, 1fr))` }}
      >
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => toggleOption(option.value)}
            className={`px-2 py-2 rounded-lg text-sm font-medium transition-colors text-center flex items-center justify-center min-h-[40px] ${
              value.includes(option.value)
                ? 'bg-[var(--tg-theme-button-color)] text-[var(--tg-theme-button-text-color)]'
                : 'bg-[var(--tg-theme-secondary-bg-color)] text-[var(--tg-theme-text-color)] border border-[var(--tg-theme-hint-color)]'
            }`}
          >
            <span className="truncate">{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
