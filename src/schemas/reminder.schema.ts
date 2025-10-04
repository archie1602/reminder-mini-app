import { z } from 'zod';
import { RuleType, TimeUnit, RuleDateMode, RuleTimeMode } from '@/api/types';

// Base schemas
const timeUnitSchema = z.nativeEnum(TimeUnit);
const ruleDateModeSchema = z.nativeEnum(RuleDateMode);
const ruleTimeModeSchema = z.nativeEnum(RuleTimeMode);

// Date and time range schemas
const dateOnlyRangeSchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

const timeRangeStepSchema = z.object({
  every: z.number().int().positive(),
  unit: timeUnitSchema,
});

const timeOnlyWithStepRangeSchema = z.object({
  from: z.string().regex(/^\d{2}:\d{2}:\d{2}$/),
  to: z.string().regex(/^\d{2}:\d{2}:\d{2}$/),
  step: timeRangeStepSchema,
});

// Rule type schemas
const ruleOneTimeSchema = z.object({
  fireAt: z.string().datetime(),
});

const ruleIntervalSchema = z.object({
  every: z.number().int().positive(),
  unit: timeUnitSchema,
});

const ruleDateSchema = z.object({
  mode: ruleDateModeSchema,
  at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  range: dateOnlyRangeSchema.optional(),
  weekDays: z.array(z.number().int().min(1).max(7)).optional().nullable(),
  monthDays: z.array(z.number().int().min(1).max(31)).optional().nullable(),
  months: z.array(z.number().int().min(1).max(12)).optional().nullable(),
});

const ruleTimeSchema = z.object({
  mode: ruleTimeModeSchema,
  at: z.string().regex(/^\d{2}:\d{2}:\d{2}$/).optional().nullable(),
  stepRange: timeOnlyWithStepRangeSchema.optional(),
});

const ruleComplexSchema = z.object({
  date: ruleDateSchema,
  time: ruleTimeSchema,
});

// Main rule schema (discriminated union)
export const ruleSchema = z.object({
  type: z.nativeEnum(RuleType),
  oneTime: ruleOneTimeSchema.optional(),
  interval: ruleIntervalSchema.optional(),
  complex: ruleComplexSchema.optional(),
}).refine((data) => {
  // Ensure the correct property is present based on type
  if (data.type === RuleType.OneTime) return !!data.oneTime;
  if (data.type === RuleType.Interval) return !!data.interval;
  if (data.type === RuleType.Complex) return !!data.complex;
  return false;
}, {
  message: 'Rule must have the corresponding property for its type',
});

// Schedule schemas
export const scheduleRequestSchema = z.object({
  rule: ruleSchema,
  type: z.nativeEnum(RuleType),
  timeZone: z.string().optional().nullable(),
});

// Reminder schemas
export const createReminderSchema = z.object({
  text: z.string().min(1, 'validation.textRequired').max(500, 'validation.textTooLong'),
  schedules: z.array(scheduleRequestSchema).min(1, 'validation.scheduleRequired'),
});

export const updateReminderSchema = z.object({
  text: z.string().min(1, 'validation.textRequired').max(500, 'validation.textTooLong').optional().nullable(),
  scheduleOperations: z.object({
    add: z.array(scheduleRequestSchema).optional().nullable(),
    delete: z.array(z.string().uuid()).optional().nullable(),
  }).optional(),
});

// Form-specific schemas for easier form handling
export type CreateReminderFormData = z.infer<typeof createReminderSchema>;
export type UpdateReminderFormData = z.infer<typeof updateReminderSchema>;
