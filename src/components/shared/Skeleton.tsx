import { FC, ReactNode } from 'react';

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

export const SkeletonReminderCard: FC = () => {
  return (
    <div className="bg-[var(--tg-theme-secondary-bg-color)] rounded-lg p-4 shadow-sm">
      <div className="space-y-3">
        {/* Title and status badge */}
        <div className="flex justify-between items-start">
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>

        {/* Rule summary */}
        <Skeleton className="h-4 w-3/4" />

        {/* Action buttons */}
        <div className="flex gap-2 mt-4">
          <Skeleton className="h-9 flex-1" />
          <Skeleton className="h-9 flex-1" />
        </div>
      </div>
    </div>
  );
};

export const SkeletonForm: FC = () => {
  return (
    <div className="space-y-6">
      {/* Page title */}
      <Skeleton className="h-8 w-48" />

      {/* Textarea field */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-24 w-full" />
      </div>

      {/* Segmented control */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-full" />
      </div>

      {/* Rule editor placeholder */}
      <div className="space-y-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>

      {/* Select field */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-full" />
      </div>

      {/* Submit button */}
      <Skeleton className="h-11 w-full" />
    </div>
  );
};

export const SkeletonListPage: FC = () => {
  return (
    <div className="min-h-screen bg-[var(--tg-theme-bg-color)] p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header with title and button */}
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-9 w-20" />
        </div>

        {/* List of reminder cards */}
        <div className="space-y-4">
          <SkeletonReminderCard />
          <SkeletonReminderCard />
          <SkeletonReminderCard />
          <SkeletonReminderCard />
          <SkeletonReminderCard />
        </div>
      </div>
    </div>
  );
};

export const FadeIn: FC<{ children: ReactNode }> = ({ children }) => {
  return <div className="fade-in">{children}</div>;
};
