// Generated from OpenAPI schema

export enum ReminderStatus {
  Inactive = 0,
  Active = 1,
}

export enum RuleType {
  OneTime = 'ONE_TIME',
  Interval = 'INTERVAL',
  Complex = 'COMPLEX',
}

export enum TimeUnit {
  Minutes = 'MINUTES',
  Hours = 'HOURS',
  Days = 'DAYS',
}

export enum RuleDateMode {
  Daily = 'DAILY',
  ExactDate = 'EXACT_DATE',
  Range = 'RANGE',
  WeekDays = 'WEEK_DAYS',
  MonthDays = 'MONTH_DAYS',
  YearDays = 'YEAR_DAYS',
}

export enum RuleTimeMode {
  ExactTime = 'EXACT_TIME',
  Range = 'RANGE',
}

export interface DateOnlyRange {
  from: string; // ISO date string
  to: string; // ISO date string
}

export interface TimeOnlyWithStepRange {
  from: string; // ISO time string (HH:mm:ss)
  to: string; // ISO time string (HH:mm:ss)
  step: TimeRangeStep;
}

export interface TimeRangeStep {
  every: number;
  unit: TimeUnit;
}

export interface RuleOneTime {
  fireAt: string; // ISO datetime string
}

export interface RuleInterval {
  every: number;
  unit: TimeUnit;
}

export interface RuleDate {
  mode: RuleDateMode;
  at?: string | null | undefined; // ISO date string
  range?: DateOnlyRange | null | undefined;
  weekDays?: number[] | null | undefined; // 1-7 (Monday-Sunday)
  monthDays?: number[] | null | undefined; // 1-31
  months?: number[] | null | undefined; // 1-12
}

export interface RuleTime {
  mode: RuleTimeMode;
  at?: string | null | undefined; // ISO time string (HH:mm:ss)
  stepRange?: TimeOnlyWithStepRange | null | undefined;
}

export interface RuleComplex {
  date: RuleDate;
  time: RuleTime;
}

export interface Rule {
  type: RuleType;
  oneTime?: RuleOneTime | null | undefined;
  interval?: RuleInterval | null | undefined;
  complex?: RuleComplex | null | undefined;
}

export interface ScheduleRequestDto {
  rule: Rule;
  type: RuleType;
  timeZone?: string | null;
}

export interface ScheduleResponseDto {
  id: string; // UUID
  rule: Rule;
  type: RuleType;
}

export interface CreateReminderDto {
  text?: string | null;
  schedules?: ScheduleRequestDto[] | null;
}

export interface UpdateReminderScheduleOperationsDto {
  add?: ScheduleRequestDto[] | null;
  delete?: string[] | null; // UUID[]
}

export interface UpdateReminderDto {
  text?: string | null;
  scheduleOperations?: UpdateReminderScheduleOperationsDto;
}

export interface GetReminderDto {
  id: string; // UUID
  text?: string | null;
  status: ReminderStatus;
  createdAt: string; // ISO datetime string
  updatedAt: string; // ISO datetime string
  schedules?: ScheduleResponseDto[] | null;
}
