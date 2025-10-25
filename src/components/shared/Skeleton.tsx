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
        {/* Title with tooltip and status badge */}
        <div className="flex justify-between items-start">
          <Skeleton className="h-6 w-2/3" />
          <div className="flex items-center gap-1">
            {/* <Skeleton className="h-6 w-6 rounded-full" />  */}
            <Skeleton className="h-6 w-16 rounded" />
          </div>
        </div>

        {/* Multiple schedule lines (representing 1-5 schedules) */}
        {/* <div className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-3/4" />
        </div> */}

        {/* NextRunAt timestamp (for active reminders) */}
        <Skeleton className="h-30 w-full" />

        {/* Action buttons */}
        <div className="flex gap-2 mt-4">
          <Skeleton className="h-9 flex-1" />
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
      <Skeleton className="h-8 w-48 mb-6" />

      {/* Text textarea field */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-24 w-full rounded-lg" />
      </div>

      {/* Timezone select field */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>

      {/* Schedules section */}
      <div className="space-y-4">
        {/* Schedules heading */}
        <Skeleton className="h-6 w-32" />

        {/* Schedule editor 1 */}
        <div className="bg-[var(--tg-theme-secondary-bg-color)] rounded-lg p-4 space-y-3">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-9 w-full" />
        </div>

        {/* Schedule editor 2 */}
        <div className="bg-[var(--tg-theme-secondary-bg-color)] rounded-lg p-4 space-y-3">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-9 w-full" />
        </div>

        {/* Add schedule button */}
        <Skeleton className="h-9 w-full rounded-lg" />
      </div>

      {/* Submit button */}
      <Skeleton className="h-11 w-full rounded-lg" />
    </div>
  );
};

export const SkeletonListPage: FC = () => {
  return (
    <div className="min-h-screen bg-[var(--tg-theme-bg-color)] p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header with title, sort button, and create button */}
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-8 w-32" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-10" /> {/* Sort/Filter button */}
            <Skeleton className="h-9 w-20" /> {/* Create button */}
          </div>
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
