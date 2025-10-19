import { SelectHTMLAttributes, forwardRef } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Array<{ value: string | number; label: string }>;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className = '', disabled, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-[var(--tg-theme-text-color)] mb-1">
            {label}
          </label>
        )}
        <select
          ref={ref}
          disabled={disabled}
          className={`w-full px-3 py-2 rounded-lg border bg-[var(--tg-theme-bg-color)] text-[var(--tg-theme-text-color)] border-[var(--tg-theme-hint-color)] focus:outline-none focus:border-[var(--tg-theme-button-color)] ${
            error ? 'border-red-500' : ''
          } ${disabled ? 'opacity-60 cursor-not-allowed' : ''} ${className}`}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
