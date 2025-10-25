import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export interface TimezoneOption {
  value: string;
  label: string;
}

// Get UTC offset for a timezone
const getUTCOffset = (tz: string): string => {
  try {
    const now = dayjs().tz(tz);
    const offsetMinutes = now.utcOffset();
    const hours = Math.floor(Math.abs(offsetMinutes) / 60);
    const minutes = Math.abs(offsetMinutes) % 60;
    const sign = offsetMinutes >= 0 ? '+' : '-';

    if (minutes === 0) {
      return `UTC${sign}${hours}`;
    }
    return `UTC${sign}${hours}:${minutes.toString().padStart(2, '0')}`;
  } catch {
    return 'UTC';
  }
};

// Format timezone label with offset
const formatTimezoneLabel = (tz: string): string => {
  const offset = getUTCOffset(tz);
  const cityName = tz.split('/').pop()?.replace(/_/g, ' ') || tz;
  return `${cityName} (${offset})`;
};

// Get all IANA timezones as a flat alphabetically sorted list
export const getAllTimezones = (): TimezoneOption[] => {
  // Get all available timezones
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allTz = (Intl as any).supportedValuesOf ? (Intl as any).supportedValuesOf('timeZone') : [];

  // Fallback to a curated list if supportedValuesOf is not available
  const fallbackTimezones = [
    'UTC',
    'Africa/Abidjan', 'Africa/Accra', 'Africa/Addis_Ababa', 'Africa/Algiers', 'Africa/Cairo', 'Africa/Casablanca', 'Africa/Johannesburg', 'Africa/Lagos', 'Africa/Nairobi', 'Africa/Tunis',
    'America/Anchorage', 'America/Argentina/Buenos_Aires', 'America/Bogota', 'America/Caracas', 'America/Chicago', 'America/Denver', 'America/Lima', 'America/Los_Angeles', 'America/Mexico_City', 'America/New_York', 'America/Panama', 'America/Phoenix', 'America/Santiago', 'America/Sao_Paulo', 'America/Toronto', 'America/Vancouver',
    'Asia/Baghdad', 'Asia/Baku', 'Asia/Bangkok', 'Asia/Beirut', 'Asia/Dhaka', 'Asia/Dubai', 'Asia/Hong_Kong', 'Asia/Jakarta', 'Asia/Jerusalem', 'Asia/Karachi', 'Asia/Kathmandu', 'Asia/Kolkata', 'Asia/Kuwait', 'Asia/Manila', 'Asia/Riyadh', 'Asia/Seoul', 'Asia/Shanghai', 'Asia/Singapore', 'Asia/Taipei', 'Asia/Tehran', 'Asia/Tokyo', 'Asia/Vladivostok', 'Asia/Yangon',
    'Atlantic/Azores', 'Atlantic/Cape_Verde', 'Atlantic/Reykjavik',
    'Australia/Adelaide', 'Australia/Brisbane', 'Australia/Darwin', 'Australia/Melbourne', 'Australia/Perth', 'Australia/Sydney',
    'Europe/Amsterdam', 'Europe/Athens', 'Europe/Belgrade', 'Europe/Berlin', 'Europe/Brussels', 'Europe/Bucharest', 'Europe/Budapest', 'Europe/Dublin', 'Europe/Helsinki', 'Europe/Istanbul', 'Europe/Kyiv', 'Europe/Lisbon', 'Europe/London', 'Europe/Madrid', 'Europe/Moscow', 'Europe/Paris', 'Europe/Prague', 'Europe/Rome', 'Europe/Stockholm', 'Europe/Vienna', 'Europe/Warsaw', 'Europe/Zurich',
    'Pacific/Auckland', 'Pacific/Fiji', 'Pacific/Guam', 'Pacific/Honolulu', 'Pacific/Midway', 'Pacific/Tongatapu',
  ];

  const timezonesToUse = allTz.length > 0 ? allTz : fallbackTimezones;

  // Create flat list of all timezones with formatted labels
  const timezones: TimezoneOption[] = timezonesToUse.map((tz: string) => ({
    value: tz,
    label: tz === 'UTC' ? 'UTC' : formatTimezoneLabel(tz),
  }));

  // Sort alphabetically by label (city name)
  timezones.sort((a, b) => a.label.localeCompare(b.label));

  return timezones;
};

// Memoized timezone list (calculated once)
let cachedTimezones: TimezoneOption[] | null = null;

export const allTimezones = (): TimezoneOption[] => {
  if (!cachedTimezones) {
    cachedTimezones = getAllTimezones();
  }
  return cachedTimezones;
};

export const getDefaultTimezone = (): string => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
};
