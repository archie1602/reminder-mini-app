import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

// Detect if browser is Safari (including iOS Safari)
const isSafari = () => {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator.userAgent;
  return /^((?!chrome|android).)*safari/i.test(ua) || /iPhone|iPad|iPod/.test(ua);
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    const isDateTimeInput = props.type === 'date' || props.type === 'time' || props.type === 'datetime-local';
    const needsWrapper = isDateTimeInput && isSafari();

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-[var(--tg-theme-text-color)] mb-1">
            {label}
          </label>
        )}
        {needsWrapper ? (
          <div className="pr-5">
            <input
              ref={ref}
              className={`w-full px-3 py-2 rounded-lg border bg-[var(--tg-theme-bg-color)] text-[var(--tg-theme-text-color)] border-[var(--tg-theme-hint-color)] focus:outline-none focus:border-[var(--tg-theme-button-color)] ${
                error ? 'border-red-500' : ''
              } ${className}`}
              {...props}
            />
          </div>
        ) : (
          <input
            ref={ref}
            className={`w-full px-3 py-2 rounded-lg border bg-[var(--tg-theme-bg-color)] text-[var(--tg-theme-text-color)] border-[var(--tg-theme-hint-color)] focus:outline-none focus:border-[var(--tg-theme-button-color)] ${
              error ? 'border-red-500' : ''
            } ${className}`}
            {...props}
          />
        )}
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
