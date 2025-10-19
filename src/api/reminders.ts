import apiClient from './client';
import {
  CreateReminderDto,
  UserReminderResponse,
  UpdateReminderDto,
  ReminderSortBy,
  SortOrder,
  GetPagedUserRemindersQueryResponse,
  ReminderCreatedResponseDto,
  UpdateUserReminderCommandResponse,
  PauseUserReminderCommandResponse,
  ActivatePausedReminderCommandResponse,
  ConvertEndedReminderToDraftCommandResponse
} from './types';

export interface GetRemindersParams {
  page?: number;
  pageSize?: number;
  sortBy?: ReminderSortBy;
  order?: SortOrder;
}

export const remindersApi = {
  getAll: async (params?: GetRemindersParams): Promise<GetPagedUserRemindersQueryResponse> => {
    // Set default pagination values
    const defaultParams: GetRemindersParams = {
      page: 1,
      pageSize: 20,
      sortBy: ReminderSortBy.CreatedAt,
      order: SortOrder.Desc,
      ...params,
    };

    // Filter out undefined values to avoid sending them to the API
    const filteredParams = Object.fromEntries(
      Object.entries(defaultParams).filter(([_, value]) => value !== undefined)
    );

    const response = await apiClient.get<GetPagedUserRemindersQueryResponse>('/reminders', {
      params: filteredParams
    });
    return response.data;
  },

  getById: async (id: string): Promise<UserReminderResponse> => {
    const response = await apiClient.get<UserReminderResponse>(`/reminders/${id}`);
    return response.data;
  },

  create: async (data: CreateReminderDto): Promise<ReminderCreatedResponseDto> => {
    const response = await apiClient.post<ReminderCreatedResponseDto>('/reminders', data);
    return response.data;
  },

  update: async (id: string, data: UpdateReminderDto): Promise<UpdateUserReminderCommandResponse> => {
    const response = await apiClient.patch<UpdateUserReminderCommandResponse>(`/reminders/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/reminders/${id}`);
  },

  pause: async (id: string): Promise<PauseUserReminderCommandResponse> => {
    const response = await apiClient.patch<PauseUserReminderCommandResponse>(`/reminders/${id}/pause`);
    return response.data;
  },

  activate: async (id: string): Promise<ActivatePausedReminderCommandResponse> => {
    const response = await apiClient.patch<ActivatePausedReminderCommandResponse>(`/reminders/${id}/activate`);
    return response.data;
  },

  convertToDraft: async (id: string): Promise<ConvertEndedReminderToDraftCommandResponse> => {
    const response = await apiClient.patch<ConvertEndedReminderToDraftCommandResponse>(`/reminders/${id}/convert-to-draft`);
    return response.data;
  },
};
