import { http, HttpResponse } from 'msw';
import { CreateReminderDto, UserReminderResponse, ReminderStatus, UpdateReminderDto, ChangeReminderStatusDto, GetPagedUserRemindersQueryResponse } from '@/api/types';
import { remindersStore, addReminder, updateReminder, deleteReminder, getReminder } from './data';

const API_BASE = '/v1';

export const handlers = [
  // GET /v1/reminders - List all reminders with pagination
  http.get(`${API_BASE}/reminders`, ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '20');

    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedReminders = remindersStore.slice(startIndex, endIndex);
    const hasNext = endIndex < remindersStore.length;

    const response: GetPagedUserRemindersQueryResponse = {
      reminders: paginatedReminders,
      hasNext: hasNext,
    };

    return HttpResponse.json(response);
  }),

  // GET /v1/reminders/:id - Get single reminder
  http.get(`${API_BASE}/reminders/:id`, ({ params }) => {
    const { id } = params;
    const reminder = getReminder(id as string);

    if (!reminder) {
      return new HttpResponse(null, { status: 404 });
    }

    return HttpResponse.json(reminder);
  }),

  // POST /v1/reminders - Create reminder
  http.post(`${API_BASE}/reminders`, async ({ request }) => {
    const body = await request.json() as CreateReminderDto;

    const newReminder: UserReminderResponse = {
      id: crypto.randomUUID(),
      text: body.text || null,
      status: ReminderStatus.Active,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      schedules: body.schedules?.map(schedule => ({
        id: crypto.randomUUID(),
        rule: schedule.rule,
        timeZone: schedule.timeZone,
      })) || null,
    };

    addReminder(newReminder);

    return new HttpResponse(null, { status: 200 });
  }),

  // PATCH /v1/reminders/:id - Update reminder
  http.patch(`${API_BASE}/reminders/:id`, async ({ params, request }) => {
    const { id } = params;
    const body = await request.json() as UpdateReminderDto;
    const reminder = getReminder(id as string);

    if (!reminder) {
      return new HttpResponse(null, { status: 404 });
    }

    const updates: Partial<UserReminderResponse> = {};

    if (body.text !== undefined) {
      updates.text = body.text;
    }

    if (body.scheduleOperations) {
      const currentSchedules = reminder.schedules || [];
      let newSchedules = [...currentSchedules];

      // Handle deletions
      if (body.scheduleOperations?.delete) {
        newSchedules = newSchedules.filter(
          s => !body.scheduleOperations?.delete?.includes(s.id)
        );
      }

      // Handle additions
      if (body.scheduleOperations?.add) {
        const addedSchedules = body.scheduleOperations.add.map(schedule => ({
          id: crypto.randomUUID(),
          rule: schedule.rule,
          timeZone: schedule.timeZone,
        }));
        newSchedules = [...newSchedules, ...addedSchedules];
      }

      updates.schedules = newSchedules;
    }

    updateReminder(id as string, updates);

    return new HttpResponse(null, { status: 200 });
  }),

  // DELETE /v1/reminders/:id - Delete reminder
  http.delete(`${API_BASE}/reminders/:id`, ({ params }) => {
    const { id } = params;
    const reminder = getReminder(id as string);

    if (!reminder) {
      return new HttpResponse(null, { status: 404 });
    }

    deleteReminder(id as string);

    return new HttpResponse(null, { status: 200 });
  }),

  // PATCH /v1/reminders/:id/status - Change reminder status
  http.patch(`${API_BASE}/reminders/:id/status`, async ({ params, request }) => {
    const { id } = params;
    const body = await request.json() as ChangeReminderStatusDto;
    const reminder = getReminder(id as string);

    if (!reminder) {
      return new HttpResponse(null, { status: 404 });
    }

    updateReminder(id as string, { status: body.status });

    return new HttpResponse(null, { status: 200 });
  }),
];
