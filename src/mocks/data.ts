import { UserReminderResponse, ReminderState, RuleType, RuleDateMode, RuleTimeMode, TimeUnit } from '@/api/types';

export const mockReminders: UserReminderResponse[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    text: 'Team meeting',
    timeZone: 'UTC',
    status: ReminderState.Active,
    createdAt: '2025-01-01T10:00:00Z',
    updatedAt: '2025-01-01T10:00:00Z',
    pausedAt: null,
    endedAt: null,
    nextRunAt: '2025-10-05T14:30:00Z',
    schedules: [
      {
        id: '550e8400-e29b-41d4-a716-446655440011',
        rule: {
          type: RuleType.OneTime,
          oneTime: {
            fireAt: '2025-10-05T14:30:00Z',
          },
        },
        lastRunAt: null,
      },
    ],
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    text: 'Take medication',
    timeZone: 'UTC',
    status: ReminderState.Active,
    createdAt: '2025-01-02T08:00:00Z',
    updatedAt: '2025-01-02T08:00:00Z',
    pausedAt: null,
    endedAt: null,
    nextRunAt: '2025-10-19T16:00:00Z',
    schedules: [
      {
        id: '550e8400-e29b-41d4-a716-446655440012',
        rule: {
          type: RuleType.Interval,
          interval: {
            every: 8,
            unit: TimeUnit.Hours,
          },
        },
        lastRunAt: '2025-10-19T08:00:00Z',
      },
    ],
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    text: 'Morning standup',
    timeZone: 'UTC',
    status: ReminderState.Active,
    createdAt: '2025-01-03T07:00:00Z',
    updatedAt: '2025-01-03T07:00:00Z',
    pausedAt: null,
    endedAt: null,
    nextRunAt: '2025-10-20T09:00:00Z',
    schedules: [
      {
        id: '550e8400-e29b-41d4-a716-446655440013',
        rule: {
          type: RuleType.Complex,
          complex: {
            date: {
              mode: RuleDateMode.Daily,
            },
            time: {
              mode: RuleTimeMode.ExactTime,
              at: '09:00:00',
            },
          },
        },
        lastRunAt: '2025-10-19T09:00:00Z',
      },
    ],
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440004',
    text: 'Weekly review',
    timeZone: 'UTC',
    status: ReminderState.Paused,
    createdAt: '2025-01-04T06:00:00Z',
    updatedAt: '2025-01-04T06:00:00Z',
    pausedAt: '2025-10-18T12:00:00Z',
    endedAt: null,
    nextRunAt: null,
    schedules: [
      {
        id: '550e8400-e29b-41d4-a716-446655440014',
        rule: {
          type: RuleType.Complex,
          complex: {
            date: {
              mode: RuleDateMode.WeekDays,
              weekDays: [1, 3, 5], // Mon, Wed, Fri
            },
            time: {
              mode: RuleTimeMode.ExactTime,
              at: '17:00:00',
            },
          },
        },
        lastRunAt: '2025-10-18T17:00:00Z',
      },
    ],
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440005',
    text: 'Monthly report',
    timeZone: 'UTC',
    status: ReminderState.Ended,
    createdAt: '2025-01-05T05:00:00Z',
    updatedAt: '2025-01-05T05:00:00Z',
    pausedAt: null,
    endedAt: '2025-10-01T10:00:00Z',
    nextRunAt: null,
    schedules: [
      {
        id: '550e8400-e29b-41d4-a716-446655440015',
        rule: {
          type: RuleType.Complex,
          complex: {
            date: {
              mode: RuleDateMode.MonthDays,
              monthDays: [1, 15], // 1st and 15th
            },
            time: {
              mode: RuleTimeMode.ExactTime,
              at: '10:00:00',
            },
          },
        },
        lastRunAt: '2025-10-01T10:00:00Z',
      },
    ],
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440006',
    text: 'Drink water',
    timeZone: 'UTC',
    status: ReminderState.Draft,
    createdAt: '2025-01-06T04:00:00Z',
    updatedAt: '2025-01-06T04:00:00Z',
    pausedAt: null,
    endedAt: null,
    nextRunAt: null,
    schedules: [
      {
        id: '550e8400-e29b-41d4-a716-446655440016',
        rule: {
          type: RuleType.Complex,
          complex: {
            date: {
              mode: RuleDateMode.Daily,
            },
            time: {
              mode: RuleTimeMode.Range,
              stepRange: {
                from: '09:00:00',
                to: '17:00:00',
                step: {
                  every: 2,
                  unit: TimeUnit.Hours,
                },
              },
            },
          },
        },
        lastRunAt: null,
      },
    ],
  },
];

// In-memory storage for MSW
export let remindersStore = [...mockReminders];

export const resetStore = () => {
  remindersStore = [...mockReminders];
};

export const addReminder = (reminder: UserReminderResponse) => {
  remindersStore.push(reminder);
};

export const updateReminder = (id: string, updates: Partial<UserReminderResponse>) => {
  const index = remindersStore.findIndex((r) => r.id === id);
  if (index !== -1) {
    remindersStore[index] = { ...remindersStore[index], ...updates, updatedAt: new Date().toISOString() };
  }
};

export const deleteReminder = (id: string) => {
  remindersStore = remindersStore.filter((r) => r.id !== id);
};

export const getReminder = (id: string) => {
  return remindersStore.find((r) => r.id === id);
};
