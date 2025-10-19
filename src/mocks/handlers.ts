import { http, HttpResponse } from 'msw';
import { CreateReminderDto, UserReminderResponse, ReminderState, UpdateReminderDto, GetPagedUserRemindersQueryResponse, ReminderCreatedResponseDto, UpdateUserReminderCommandResponse, PauseUserReminderCommandResponse, ActivatePausedReminderCommandResponse, ConvertEndedReminderToDraftCommandResponse } from '@/api/types';
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

    const reminderId = crypto.randomUUID();
    const newReminder: UserReminderResponse = {
      id: reminderId,
      text: body.text || null,
      timeZone: body.timeZone || null,
      status: ReminderState.Active,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      pausedAt: null,
      endedAt: null,
      nextRunAt: null,
      schedules: body.schedules?.map(schedule => ({
        id: crypto.randomUUID(),
        rule: schedule.rule,
        lastRunAt: null,
      })) || null,
    };

    addReminder(newReminder);

    const response: ReminderCreatedResponseDto = {
      reminderId: reminderId,
    };

    return HttpResponse.json(response, { status: 201 });
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
    let hasChanges = false;

    if (body.text !== undefined && body.text !== reminder.text) {
      updates.text = body.text;
      hasChanges = true;
    }

    if (body.scheduleOperations) {
      const currentSchedules = reminder.schedules || [];
      let newSchedules = [...currentSchedules];

      // Handle deletions
      if (body.scheduleOperations?.delete && body.scheduleOperations.delete.length > 0) {
        newSchedules = newSchedules.filter(
          s => !body.scheduleOperations?.delete?.includes(s.id)
        );
        hasChanges = true;
      }

      // Handle additions
      if (body.scheduleOperations?.add && body.scheduleOperations.add.length > 0) {
        const addedSchedules = body.scheduleOperations.add.map(schedule => ({
          id: crypto.randomUUID(),
          rule: schedule.rule,
          lastRunAt: null,
        }));
        newSchedules = [...newSchedules, ...addedSchedules];
        hasChanges = true;
      }

      updates.schedules = newSchedules;
    }

    updateReminder(id as string, updates);

    const updatedReminder = getReminder(id as string)!;
    const response: UpdateUserReminderCommandResponse = {
      message: hasChanges ? 'Reminder updated successfully' : 'No changes made',
      hasChanges: hasChanges,
      updatedReminder: updatedReminder,
    };

    return HttpResponse.json(response, { status: 200 });
  }),

  // DELETE /v1/reminders/:id - Delete reminder
  http.delete(`${API_BASE}/reminders/:id`, ({ params }) => {
    const { id } = params;
    const reminder = getReminder(id as string);

    if (!reminder) {
      return new HttpResponse(null, { status: 404 });
    }

    deleteReminder(id as string);

    return new HttpResponse(null, { status: 204 });
  }),

  // PATCH /v1/reminders/:id/pause - Pause reminder
  http.patch(`${API_BASE}/reminders/:id/pause`, ({ params }) => {
    const { id } = params;
    const reminder = getReminder(id as string);

    if (!reminder) {
      return new HttpResponse(null, { status: 404 });
    }

    updateReminder(id as string, {
      status: ReminderState.Paused,
      pausedAt: new Date().toISOString(),
      nextRunAt: null,
    });

    const updatedReminder = getReminder(id as string)!;
    const response: PauseUserReminderCommandResponse = {
      message: 'Reminder paused successfully',
      updatedReminder: updatedReminder,
    };

    return HttpResponse.json(response, { status: 200 });
  }),

  // PATCH /v1/reminders/:id/activate - Activate paused reminder
  http.patch(`${API_BASE}/reminders/:id/activate`, ({ params }) => {
    const { id } = params;
    const reminder = getReminder(id as string);

    if (!reminder) {
      return new HttpResponse(null, { status: 404 });
    }

    updateReminder(id as string, {
      status: ReminderState.Active,
      pausedAt: null,
      nextRunAt: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
    });

    const updatedReminder = getReminder(id as string)!;
    const response: ActivatePausedReminderCommandResponse = {
      message: 'Reminder activated successfully',
      reminder: updatedReminder,
    };

    return HttpResponse.json(response, { status: 200 });
  }),

  // PATCH /v1/reminders/:id/convert-to-draft - Convert ended reminder to draft
  http.patch(`${API_BASE}/reminders/:id/convert-to-draft`, ({ params }) => {
    const { id } = params;
    const reminder = getReminder(id as string);

    if (!reminder) {
      return new HttpResponse(null, { status: 404 });
    }

    updateReminder(id as string, {
      status: ReminderState.Draft,
      endedAt: null,
      nextRunAt: null,
    });

    const updatedReminder = getReminder(id as string)!;
    const response: ConvertEndedReminderToDraftCommandResponse = {
      message: 'Reminder converted to draft successfully',
      updatedReminder: updatedReminder,
    };

    return HttpResponse.json(response, { status: 200 });
  }),
];
