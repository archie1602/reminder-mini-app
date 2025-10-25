import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { RefreshCw, Clock } from 'lucide-react';
import { formatDateTime } from '@/utils/timeFormat';
import { useSharedTimer } from '@/hooks/useSharedTimer';
import { REMINDERS_QUERY_KEY } from '@/hooks/useReminders';
import { Button } from '@/components/shared/Button';

interface NextRunAtProps {
  nextRunAt: string;
  timeZone?: string | null;
}

export const NextRunAt: FC<NextRunAtProps> = ({ nextRunAt, timeZone }) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  // Use shared timer with adaptive intervals based on nextRunAt
  useSharedTimer(nextRunAt);

  // Parse nextRunAt in the reminder's timezone for accurate comparison
  const nextRunDate = timeZone
    ? dayjs.tz(nextRunAt, timeZone)  // Parse in reminder's timezone
    : dayjs(nextRunAt);               // Fallback to browser timezone if no timezone set

  // Get current time in the same timezone for fair comparison
  const now = timeZone
    ? dayjs().tz(timeZone)            // Current time in reminder's timezone
    : dayjs();                        // Fallback to browser time

  const hasPassed = now.isAfter(nextRunDate);

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: REMINDERS_QUERY_KEY });
  };

  // Show refresh badge if the scheduled time has passed
  if (hasPassed) {
    return (
      <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <RefreshCw size={16} className="flex-shrink-0 text-orange-600 dark:text-orange-400" />
          <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">
            {t('reminder.updateAvailable')}
          </p>
        </div>
        <Button
          onClick={handleRefresh}
          variant="secondary"
          className="flex-shrink-0 text-sm px-3 py-1"
        >
          {t('common.refresh')}
        </Button>
      </div>
    );
  }

  // Show normal time display if reminder hasn't fired yet
  const absoluteTime = formatDateTime(nextRunAt);
  const relativeTime = nextRunDate.fromNow();

  return (
    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 flex items-start gap-2">
      <Clock size={16} className="flex-shrink-0 text-blue-600 dark:text-blue-400 mt-[2px]" />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
          {t('reminder.nextFire')}:
        </p>
        <p className="text-sm text-blue-600 dark:text-blue-400">
          {absoluteTime} ({relativeTime})
        </p>
        {timeZone && (
          <p className="text-xs text-blue-500/70 dark:text-blue-400/70 mt-1">
            {timeZone}
          </p>
        )}
      </div>
    </div>
  );
};
