import dayjs from 'dayjs';

/**
 * Formats a time string or Date object in 24-hour format
 * @param time - Time string (HH:mm:ss, HH:mm, or ISO datetime) or Date object
 * @param includeSeconds - Whether to include seconds in the output
 * @returns Formatted time string in 24-hour format (HH:mm or HH:mm:ss)
 */
export const formatTime = (time: string | Date, includeSeconds = false): string => {
  let dayjsTime: dayjs.Dayjs;

  if (typeof time === 'string') {
    // Check if it's an ISO datetime string (contains 'T' or full date)
    if (time.includes('T') || time.match(/^\d{4}-\d{2}-\d{2}/)) {
      dayjsTime = dayjs(time);
    } else {
      // It's a time-only string like "09:00:00" or "09:00"
      dayjsTime = dayjs(`2000-01-01 ${time}`);
    }
  } else {
    dayjsTime = dayjs(time);
  }

  return dayjsTime.format(includeSeconds ? 'HH:mm:ss' : 'HH:mm');
};

/**
 * Formats a datetime string or Date object in 24-hour format
 * @param datetime - Datetime string or Date object
 * @param dateFormat - dayjs format for the date part (default: 'MMM D, YYYY')
 * @returns Formatted datetime string with 24-hour time
 */
export const formatDateTime = (
  datetime: string | Date,
  dateFormat = 'MMM D, YYYY'
): string => {
  const dayjsDateTime = dayjs(datetime);
  return dayjsDateTime.format(`${dateFormat} [at] HH:mm`);
};

/**
 * Gets the dayjs format string for time in 24-hour format
 * @param includeSeconds - Whether to include seconds
 * @returns dayjs format string (HH:mm or HH:mm:ss)
 */
export const getTimeFormat = (includeSeconds = false): string => {
  return includeSeconds ? 'HH:mm:ss' : 'HH:mm';
};
