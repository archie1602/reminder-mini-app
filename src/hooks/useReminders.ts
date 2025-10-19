import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { remindersApi, GetRemindersParams } from '@/api/reminders';
import { CreateReminderDto, UpdateReminderDto } from '@/api/types';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

export const REMINDERS_QUERY_KEY = ['reminders'];

export const useReminders = (params?: GetRemindersParams) => {
  return useQuery({
    queryKey: [...REMINDERS_QUERY_KEY, params],
    queryFn: () => remindersApi.getAll(params),
  });
};

export const useInfiniteReminders = (params?: Omit<GetRemindersParams, 'page'>) => {
  return useInfiniteQuery({
    queryKey: [...REMINDERS_QUERY_KEY, 'infinite', params],
    queryFn: ({ pageParam = 1 }) => remindersApi.getAll({ ...params, page: pageParam }),
    getNextPageParam: (lastPage, allPages) => {
      // Use hasNext from API response
      if (lastPage.hasNext) {
        return allPages.length + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });
};

export const useReminder = (id: string) => {
  return useQuery({
    queryKey: [...REMINDERS_QUERY_KEY, id],
    queryFn: () => remindersApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateReminder = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (data: CreateReminderDto) => remindersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REMINDERS_QUERY_KEY });
      toast.success(t('toast.createSuccess'));
    },
    onError: () => {
      toast.error(t('toast.error'));
    },
  });
};

export const useUpdateReminder = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateReminderDto }) =>
      remindersApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REMINDERS_QUERY_KEY });
      toast.success(t('toast.updateSuccess'));
    },
    onError: () => {
      toast.error(t('toast.error'));
    },
  });
};

export const useDeleteReminder = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (id: string) => remindersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REMINDERS_QUERY_KEY });
      toast.success(t('toast.deleteSuccess'));
    },
    onError: () => {
      toast.error(t('toast.error'));
    },
  });
};

export const usePauseReminder = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (id: string) => remindersApi.pause(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REMINDERS_QUERY_KEY });
      toast.success(t('toast.pauseSuccess'));
    },
    onError: () => {
      toast.error(t('toast.error'));
    },
  });
};

export const useActivateReminder = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (id: string) => remindersApi.activate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REMINDERS_QUERY_KEY });
      toast.success(t('toast.activateSuccess'));
    },
    onError: () => {
      toast.error(t('toast.error'));
    },
  });
};

export const useConvertToDraft = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (id: string) => remindersApi.convertToDraft(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REMINDERS_QUERY_KEY });
      toast.success(t('toast.convertToDraftSuccess'));
    },
    onError: () => {
      toast.error(t('toast.error'));
    },
  });
};
