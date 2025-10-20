import { FC, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { formatDateTime } from '@/utils/timeFormat';

interface NextRunAtProps {
  nextRunAt: string;
  timeZone?: string | null;
}

export const NextRunAt: FC<NextRunAtProps> = ({ nextRunAt }) => {
  const { t } = useTranslation();
  const [, setCurrentTime] = useState(Date.now());

  // Update every minute to keep relative time fresh
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 60000); // 60 seconds

    return () => clearInterval(interval);
  }, []);

  const nextRunDate = dayjs(nextRunAt);
  const absoluteTime = formatDateTime(nextRunAt);
  const relativeTime = nextRunDate.fromNow();

  return (
    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 flex items-start gap-2">
      <span className="text-lg flex-shrink-0 min-w-[1.5em]">⏰</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
          {t('reminder.nextFire')}:
        </p>
        <p className="text-sm text-blue-600 dark:text-blue-400">
          {absoluteTime} ({relativeTime})
        </p>
      </div>
    </div>
  );
};
