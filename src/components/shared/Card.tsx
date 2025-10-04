import { FC, ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: FC<CardProps> = ({ children, className = '', onClick }) => {
  return (
    <div
      className={`bg-[var(--tg-theme-secondary-bg-color)] rounded-lg p-4 shadow-sm ${
        onClick ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''
      } ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
