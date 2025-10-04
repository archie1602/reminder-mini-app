import apiClient from './client';
import { CreateReminderDto, GetReminderDto, UpdateReminderDto } from './types';

export const remindersApi = {
  getAll: async (): Promise<GetReminderDto[]> => {
    const response = await apiClient.get<GetReminderDto[]>('/reminders');
    return response.data;
  },

  getById: async (id: string): Promise<GetReminderDto> => {
    const response = await apiClient.get<GetReminderDto>(`/reminders/${id}`);
    return response.data;
  },

  create: async (data: CreateReminderDto): Promise<GetReminderDto> => {
    const response = await apiClient.post<GetReminderDto>('/reminders', data);
    return response.data;
  },

  update: async (id: string, data: UpdateReminderDto): Promise<void> => {
    await apiClient.patch(`/reminders/${id}`, data);
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/reminders/${id}`);
  },
};
