import { http, HttpResponse } from 'msw';
import { CreateReminderDto, GetReminderDto, ReminderStatus, UpdateReminderDto } from '@/api/types';
import { remindersStore, addReminder, updateReminder, deleteReminder, getReminder } from './data';

const API_BASE = '/v1';

export const handlers = [
  // GET /v1/reminders - List all reminders
  http.get(`${API_BASE}/reminders`, () => {
    return HttpResponse.json(remindersStore);
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

    const newReminder: GetReminderDto = {
      id: crypto.randomUUID(),
      text: body.text || null,
      status: ReminderStatus.Active,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      schedules: body.schedules?.map(schedule => ({
        id: crypto.randomUUID(),
        rule: schedule.rule,
        type: schedule.type,
      })) || null,
    };

    addReminder(newReminder);

    return HttpResponse.json(newReminder, { status: 201 });
  }),

  // PATCH /v1/reminders/:id - Update reminder
  http.patch(`${API_BASE}/reminders/:id`, async ({ params, request }) => {
    const { id } = params;
    const body = await request.json() as UpdateReminderDto;
    const reminder = getReminder(id as string);

    if (!reminder) {
      return new HttpResponse(null, { status: 404 });
    }

    const updates: Partial<GetReminderDto> = {};

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
          type: schedule.type,
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
];
