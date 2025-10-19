import { FC, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';

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
  const absoluteTime = nextRunDate.format('MMM D, YYYY [at] h:mm A');
  const relativeTime = nextRunDate.fromNow();

  return (
    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 flex items-start gap-2">
      <span className="text-lg">⏰</span>
      <div className="flex-1">
        <p className="text-sm text-blue-600 dark:text-blue-400">
          {t('reminder.nextRunAtCombined', { datetime: absoluteTime, relative: relativeTime })}
        </p>
      </div>
    </div>
  );
};
