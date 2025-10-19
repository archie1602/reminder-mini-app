import { z } from 'zod';
import { RuleType, TimeUnit, RuleDateMode, RuleTimeMode } from '@/api/types';

// Base schemas
const timeUnitSchema = z.nativeEnum(TimeUnit);
const ruleDateModeSchema = z.nativeEnum(RuleDateMode);
const ruleTimeModeSchema = z.nativeEnum(RuleTimeMode);

// Date and time range schemas
const dateOnlyRangeSchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'validation.invalidDateFormat'),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'validation.invalidDateFormat'),
});

const timeRangeStepSchema = z.object({
  every: z.number().int().positive('validation.mustBePositive'),
  unit: timeUnitSchema,
});

const timeOnlyWithStepRangeSchema = z.object({
  from: z.string().regex(/^\d{2}:\d{2}:\d{2}$/, 'validation.invalidTimeFormat'),
  to: z.string().regex(/^\d{2}:\d{2}:\d{2}$/, 'validation.invalidTimeFormat'),
  step: timeRangeStepSchema,
});

// Rule type schemas
const ruleOneTimeSchema = z.object({
  fireAt: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/, 'validation.invalidDatetime'),
});

const ruleIntervalSchema = z.object({
  every: z.number().int().positive('validation.mustBePositive'),
  unit: timeUnitSchema,
});

const ruleDateSchema = z.object({
  mode: ruleDateModeSchema,
  at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'validation.invalidDateFormat').nullish(),
  range: dateOnlyRangeSchema.nullish(),
  weekDays: z.array(z.number().int().min(1).max(7)).nullish(),
  monthDays: z.array(z.number().int().min(1).max(31)).nullish(),
  months: z.array(z.number().int().min(1).max(12)).nullish(),
}).superRefine((data, ctx) => {
  // Validate based on mode
  if (data.mode === RuleDateMode.WeekDays) {
    if (!data.weekDays || data.weekDays.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'validation.selectWeekDays',
        path: ['weekDays'],
      });
    }
  }
  if (data.mode === RuleDateMode.MonthDays) {
    if (!data.monthDays || data.monthDays.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'validation.selectMonthDays',
        path: ['monthDays'],
      });
    }
  }
  if (data.mode === RuleDateMode.YearDays) {
    if (!data.months || data.months.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'validation.selectMonths',
        path: ['months'],
      });
    }
    if (!data.monthDays || data.monthDays.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'validation.selectMonthDays',
        path: ['monthDays'],
      });
    }
  }
});

const ruleTimeSchema = z.object({
  mode: ruleTimeModeSchema,
  at: z.string().regex(/^\d{2}:\d{2}:\d{2}$/, 'validation.invalidTimeFormat').nullish(),
  stepRange: timeOnlyWithStepRangeSchema.nullish(),
}).superRefine((data, ctx) => {
  // Validate based on mode
  if (data.mode === RuleTimeMode.ExactTime) {
    if (!data.at) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'validation.invalidTime',
        path: ['at'],
      });
    }
  }
  if (data.mode === RuleTimeMode.Range) {
    if (!data.stepRange) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'validation.invalidTimeRange',
        path: ['stepRange'],
      });
    }
  }
});

const ruleComplexSchema = z.object({
  date: ruleDateSchema,
  time: ruleTimeSchema,
});

// Main rule schema (discriminated union)
export const ruleSchema = z.object({
  type: z.nativeEnum(RuleType),
  oneTime: ruleOneTimeSchema.nullish(),
  interval: ruleIntervalSchema.nullish(),
  complex: ruleComplexSchema.nullish(),
}).refine((data) => {
  // Ensure the correct property is present based on type
  if (data.type === RuleType.OneTime) return !!data.oneTime;
  if (data.type === RuleType.Interval) return !!data.interval;
  if (data.type === RuleType.Complex) return !!data.complex;
  return false;
}, {
  message: 'validation.invalidRuleType',
});

// Schedule schemas
export const scheduleRequestSchema = z.object({
  rule: ruleSchema,
});

// Reminder schemas
export const createReminderSchema = z.object({
  text: z.string().min(1, 'validation.textRequired').max(500, 'validation.textTooLong'),
  timeZone: z.string().optional().nullable(),
  schedules: z.array(scheduleRequestSchema).min(0), // Allow 0 schedules for DRAFT creation
});

export const updateReminderSchema = z.object({
  text: z.string().min(1, 'validation.textRequired').max(500, 'validation.textTooLong').optional().nullable(),
  scheduleOperations: z.object({
    add: z.array(scheduleRequestSchema).optional().nullable(),
    delete: z.array(z.string().uuid()).optional().nullable(),
  }).optional(),
}).superRefine((data, ctx) => {
  // Ensure at least one change is present
  const hasTextChange = data.text !== undefined && data.text !== null;
  const hasScheduleAdd = data.scheduleOperations?.add && data.scheduleOperations.add.length > 0;
  const hasScheduleDelete = data.scheduleOperations?.delete && data.scheduleOperations.delete.length > 0;

  if (!hasTextChange && !hasScheduleAdd && !hasScheduleDelete) {
    ctx.addIssue({
      code: 'custom',
      message: 'validation.noChangesDetected',
      path: [],
    });
  }
});

// Form-specific schemas for easier form handling
export type CreateReminderFormData = z.infer<typeof createReminderSchema>;
export type UpdateReminderFormData = z.infer<typeof updateReminderSchema>;
