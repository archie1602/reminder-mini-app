import { Rule, RuleType, RuleDateMode, RuleTimeMode } from '@/api/types';
import dayjs from 'dayjs';
import { TFunction } from 'i18next';
import { formatTime } from './timeFormat';

export const humanizeRule = (rule: Rule, t: TFunction): string => {
  switch (rule.type) {
    case RuleType.OneTime:
      if (!rule.oneTime) return '';
      const date = dayjs(rule.oneTime.fireAt).format('LL');
      const time = formatTime(rule.oneTime.fireAt);
      return t('humanize.oneTime', { date, time });

    case RuleType.Interval:
      if (!rule.interval) return '';
      const unit = t(`timeUnit.${rule.interval.unit}`).toLowerCase();
      return t('humanize.interval', { count: rule.interval.every, unit });

    case RuleType.Complex:
      if (!rule.complex) return '';
      return humanizeComplexRule(rule.complex, t);

    default:
      return '';
  }
};

const humanizeComplexRule = (complex: Rule['complex'], t: TFunction): string => {
  if (!complex) return '';

  const { date, time } = complex;
  let datePart = '';
  let timePart = '';

  // Humanize date part
  switch (date.mode) {
    case RuleDateMode.Daily:
      if (time.mode === RuleTimeMode.ExactTime && time.at) {
        return t('humanize.daily', { time: formatTime(time.at) });
      }
      datePart = t('dateMode.DAILY');
      break;

    case RuleDateMode.ExactDate:
      if (date.at) {
        const formattedDate = dayjs(date.at).format('LL');
        if (time.mode === RuleTimeMode.ExactTime && time.at) {
          return t('humanize.exactDate', { date: formattedDate, time: formatTime(time.at) });
        }
        datePart = formattedDate;
      }
      break;

    case RuleDateMode.Range:
      if (date.range) {
        const from = dayjs(date.range.from).format('LL');
        const to = dayjs(date.range.to).format('LL');
        if (time.mode === RuleTimeMode.ExactTime && time.at) {
          return t('humanize.dateRange', { from, to, time: formatTime(time.at) });
        }
        datePart = `${from} - ${to}`;
      }
      break;

    case RuleDateMode.WeekDays:
      if (date.weekDays && date.weekDays.length > 0) {
        const days = date.weekDays
          .sort((a, b) => a - b)
          .map((d) => t(`weekDayShort.${d}`))
          .join(', ');
        if (time.mode === RuleTimeMode.ExactTime && time.at) {
          return t('humanize.weekDays', { days, time: formatTime(time.at) });
        }
        datePart = days;
      }
      break;

    case RuleDateMode.MonthDays:
      if (date.monthDays && date.monthDays.length > 0) {
        const days = date.monthDays.sort((a, b) => a - b).join(', ');
        if (time.mode === RuleTimeMode.ExactTime && time.at) {
          return t('humanize.monthDays', { days, time: formatTime(time.at) });
        }
        datePart = days;
      }
      break;

    case RuleDateMode.YearDays:
      if (date.months && date.monthDays) {
        const months = date.months
          .sort((a, b) => a - b)
          .map((m) => t(`month.${m}`))
          .join(', ');
        const days = date.monthDays.sort((a, b) => a - b).join(', ');
        if (time.mode === RuleTimeMode.ExactTime && time.at) {
          return t('humanize.yearDays', { months, days, time: formatTime(time.at) });
        }
        datePart = `${months} ${days}`;
      }
      break;
  }

  // Humanize time part
  if (time.mode === RuleTimeMode.ExactTime && time.at) {
    timePart = formatTime(time.at);
  } else if (time.mode === RuleTimeMode.Range && time.stepRange) {
    const from = formatTime(time.stepRange.from);
    const to = formatTime(time.stepRange.to);
    const step = `${time.stepRange.step.every} ${t(`timeUnit.${time.stepRange.step.unit}`).toLowerCase()}`;
    return t('humanize.timeRange', { date: datePart, from, to, step });
  }

  return `${datePart} ${timePart}`.trim();
};
