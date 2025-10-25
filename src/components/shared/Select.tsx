import { SelectHTMLAttributes, forwardRef } from 'react';
import { SearchableSelect } from './SearchableSelect';

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface SelectOptionGroup {
  group: string;
  options: SelectOption[];
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options?: SelectOption[];
  optionGroups?: SelectOptionGroup[];
  searchable?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, optionGroups, className = '', disabled, searchable = false, ...props }, ref) => {
    // If searchable and options are provided, use SearchableSelect
    if (searchable && options && !optionGroups) {
      return (
        <SearchableSelect
          label={label}
          value={(props.value as string | number) || ''}
          options={options}
          onChange={(value) => {
            // Create a synthetic event to match the native select behavior
            const syntheticEvent = {
              target: { value: value.toString() },
            } as React.ChangeEvent<HTMLSelectElement>;
            props.onChange?.(syntheticEvent);
          }}
          disabled={disabled}
          error={error}
        />
      );
    }

    // Otherwise, use native select
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
          {options && options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
          {optionGroups && optionGroups.map((group) => (
            <optgroup key={group.group} label={group.group}>
              {group.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
