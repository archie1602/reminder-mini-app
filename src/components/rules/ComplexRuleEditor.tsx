import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { DatePicker, TimePicker } from '@/components/shared/DateTimePicker';
import { Input } from '@/components/shared/Input';
import { Select } from '@/components/shared/Select';
import { MultiSelect } from '@/components/shared/MultiSelect';
import { RuleComplex, RuleDateMode, RuleTimeMode, TimeUnit } from '@/api/types';

interface ComplexRuleEditorProps {
  value: RuleComplex;
  onChange: (value: RuleComplex) => void;
}

export const ComplexRuleEditor: FC<ComplexRuleEditorProps> = ({ value, onChange }) => {
  const { t } = useTranslation();

  const dateModeOptions = [
    { value: RuleDateMode.Daily, label: t('dateMode.DAILY') },
    { value: RuleDateMode.ExactDate, label: t('dateMode.EXACT_DATE') },
    { value: RuleDateMode.Range, label: t('dateMode.RANGE') },
    { value: RuleDateMode.WeekDays, label: t('dateMode.WEEK_DAYS') },
    { value: RuleDateMode.MonthDays, label: t('dateMode.MONTH_DAYS') },
    { value: RuleDateMode.YearDays, label: t('dateMode.YEAR_DAYS') },
  ];

  const timeModeOptions = [
    { value: RuleTimeMode.ExactTime, label: t('timeMode.EXACT_TIME') },
    { value: RuleTimeMode.Range, label: t('timeMode.RANGE') },
  ];

  const timeUnitOptions = [
    { value: TimeUnit.Minutes, label: t('timeUnit.MINUTES') },
    { value: TimeUnit.Hours, label: t('timeUnit.HOURS') },
    { value: TimeUnit.Days, label: t('timeUnit.DAYS') },
  ];

  const weekDayOptions = Array.from({ length: 7 }, (_, i) => ({
    value: i + 1,
    label: t(`weekDayShort.${i + 1}`),
  }));

  const monthDayOptions = Array.from({ length: 31 }, (_, i) => ({
    value: i + 1,
    label: String(i + 1),
  }));

  const monthOptions = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: t(`month.${i + 1}`),
  }));

  const updateDateMode = (mode: RuleDateMode) => {
    onChange({
      ...value,
      date: { mode, at: null, range: undefined, weekDays: null, monthDays: null, months: null },
    });
  };

  const updateTimeMode = (mode: RuleTimeMode) => {
    onChange({
      ...value,
      time: { mode, at: null, stepRange: undefined },
    });
  };

  return (
    <div className="space-y-6">
      {/* Date Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-[var(--tg-theme-text-color)]">{t('rule.date')}</h3>

        <Select
          label={t('rule.dateMode')}
          options={dateModeOptions}
          value={value.date.mode}
          onChange={(e) => updateDateMode(e.target.value as RuleDateMode)}
        />

        {value.date.mode === RuleDateMode.ExactDate && (
          <DatePicker
            label={t('rule.at')}
            value={value.date.at || ''}
            onChange={(date) =>
              onChange({ ...value, date: { ...value.date, at: date } })
            }
          />
        )}

        {value.date.mode === RuleDateMode.Range && (
          <>
            <DatePicker
              label={t('rule.from')}
              value={value.date.range?.from || ''}
              onChange={(from) =>
                onChange({
                  ...value,
                  date: { ...value.date, range: { from, to: value.date.range?.to || from } },
                })
              }
            />
            <DatePicker
              label={t('rule.to')}
              value={value.date.range?.to || ''}
              onChange={(to) =>
                onChange({
                  ...value,
                  date: { ...value.date, range: { from: value.date.range?.from || to, to } },
                })
              }
            />
          </>
        )}

        {value.date.mode === RuleDateMode.WeekDays && (
          <MultiSelect
            label={t('rule.weekDays')}
            options={weekDayOptions}
            value={value.date.weekDays || []}
            onChange={(weekDays) =>
              onChange({ ...value, date: { ...value.date, weekDays } })
            }
          />
        )}

        {value.date.mode === RuleDateMode.MonthDays && (
          <MultiSelect
            label={t('rule.monthDays')}
            options={monthDayOptions}
            value={value.date.monthDays || []}
            onChange={(monthDays) =>
              onChange({ ...value, date: { ...value.date, monthDays } })
            }
          />
        )}

        {value.date.mode === RuleDateMode.YearDays && (
          <>
            <MultiSelect
              label={t('rule.months')}
              options={monthOptions}
              value={value.date.months || []}
              onChange={(months) =>
                onChange({ ...value, date: { ...value.date, months } })
              }
            />
            <MultiSelect
              label={t('rule.monthDays')}
              options={monthDayOptions}
              value={value.date.monthDays || []}
              onChange={(monthDays) =>
                onChange({ ...value, date: { ...value.date, monthDays } })
              }
            />
          </>
        )}
      </div>

      {/* Time Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-[var(--tg-theme-text-color)]">{t('rule.time')}</h3>

        <Select
          label={t('rule.timeMode')}
          options={timeModeOptions}
          value={value.time.mode}
          onChange={(e) => updateTimeMode(e.target.value as RuleTimeMode)}
        />

        {value.time.mode === RuleTimeMode.ExactTime && (
          <TimePicker
            label={t('rule.at')}
            value={value.time.at ? value.time.at.substring(0, 5) : ''}
            onChange={(time) =>
              onChange({ ...value, time: { ...value.time, at: time + ':00' } })
            }
          />
        )}

        {value.time.mode === RuleTimeMode.Range && (
          <>
            <TimePicker
              label={t('rule.from')}
              value={value.time.stepRange?.from?.substring(0, 5) || ''}
              onChange={(from) =>
                onChange({
                  ...value,
                  time: {
                    ...value.time,
                    stepRange: {
                      from: from + ':00',
                      to: value.time.stepRange?.to || from + ':00',
                      step: value.time.stepRange?.step || { every: 1, unit: TimeUnit.Hours },
                    },
                  },
                })
              }
            />
            <TimePicker
              label={t('rule.to')}
              value={value.time.stepRange?.to?.substring(0, 5) || ''}
              onChange={(to) =>
                onChange({
                  ...value,
                  time: {
                    ...value.time,
                    stepRange: {
                      from: value.time.stepRange?.from || to + ':00',
                      to: to + ':00',
                      step: value.time.stepRange?.step || { every: 1, unit: TimeUnit.Hours },
                    },
                  },
                })
              }
            />
            <div className="flex gap-2">
              <Input
                type="number"
                label={t('rule.every')}
                value={value.time.stepRange?.step.every || 1}
                onChange={(e) =>
                  onChange({
                    ...value,
                    time: {
                      ...value.time,
                      stepRange: {
                        ...value.time.stepRange!,
                        step: {
                          ...value.time.stepRange!.step,
                          every: parseInt(e.target.value) || 1,
                        },
                      },
                    },
                  })
                }
                min={1}
              />
              <Select
                label={t('rule.unit')}
                options={timeUnitOptions}
                value={value.time.stepRange?.step.unit || TimeUnit.Hours}
                onChange={(e) =>
                  onChange({
                    ...value,
                    time: {
                      ...value.time,
                      stepRange: {
                        ...value.time.stepRange!,
                        step: {
                          ...value.time.stepRange!.step,
                          unit: e.target.value as TimeUnit,
                        },
                      },
                    },
                  })
                }
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};
