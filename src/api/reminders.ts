import apiClient from './client';
import {
  CreateReminderDto,
  UserReminderResponse,
  UpdateReminderDto,
  ChangeReminderStatusDto,
  ReminderSortBy,
  SortOrder,
  GetPagedUserRemindersQueryResponse
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

  create: async (data: CreateReminderDto): Promise<void> => {
    await apiClient.post('/reminders', data);
  },

  update: async (id: string, data: UpdateReminderDto): Promise<void> => {
    await apiClient.patch(`/reminders/${id}`, data);
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/reminders/${id}`);
  },

  changeStatus: async (id: string, data: ChangeReminderStatusDto): Promise<void> => {
    await apiClient.patch(`/reminders/${id}/status`, data);
  },
};
