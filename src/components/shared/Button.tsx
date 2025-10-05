import { ButtonHTMLAttributes, FC } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  fullWidth?: boolean;
}

export const Button: FC<ButtonProps> = ({
  variant = 'primary',
  fullWidth = false,
  className = '',
  children,
  ...props
}) => {
  const baseClasses = 'px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

  const variantClasses = {
    primary: 'bg-[var(--tg-theme-button-color)] text-[var(--tg-theme-button-text-color)] hover:opacity-90',
    secondary: 'bg-[var(--tg-theme-secondary-bg-color)] text-[var(--tg-theme-text-color)] hover:opacity-90 border border-[var(--tg-theme-hint-color)]',
    danger: 'bg-red-500 text-white hover:bg-red-600',
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${widthClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
