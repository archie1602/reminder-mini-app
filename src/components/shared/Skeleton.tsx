import { FC } from 'react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: FC<SkeletonProps> = ({ className = '' }) => {
  return (
    <div
      className={`animate-pulse bg-[var(--tg-theme-hint-color)] opacity-20 rounded ${className}`}
    />
  );
};

export const SkeletonCard: FC = () => {
  return (
    <div className="bg-[var(--tg-theme-secondary-bg-color)] rounded-lg p-4 shadow-sm">
      <Skeleton className="h-5 w-3/4 mb-2" />
      <Skeleton className="h-4 w-1/2 mb-1" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  );
};
