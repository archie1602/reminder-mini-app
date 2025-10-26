import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { remindersApi, GetRemindersParams } from '@/api/reminders';
import { CreateReminderDto, UpdateReminderDto } from '@/api/types';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { getMutationErrorMessage, ErrorCode, extractErrorDetails } from '@/utils/errorHelpers';

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
    onError: (error) => {
      const message = getMutationErrorMessage(error, 'create', t);
      toast.error(message);
    },
  });
};

export const useUpdateReminder = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateReminderDto }) =>
      remindersApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REMINDERS_QUERY_KEY });
      toast.success(t('toast.updateSuccess'));
    },
    onError: (error) => {
      const details = extractErrorDetails(error);
      const message = getMutationErrorMessage(error, 'update', t);
      toast.error(message);

      // If reminder was deleted, navigate back to list
      if (details.errorCode === ErrorCode.REMINDER_NOT_FOUND) {
        setTimeout(() => navigate('/'), 2000);
      }
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
    onError: (error) => {
      const message = getMutationErrorMessage(error, 'delete', t);
      toast.error(message);
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
    onError: (error) => {
      const message = getMutationErrorMessage(error, 'pause', t);
      toast.error(message);
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
    onError: (error) => {
      const message = getMutationErrorMessage(error, 'activate', t);
      toast.error(message);
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
      toast.success(t('toast.draftSuccess'));
    },
    onError: (error) => {
      const message = getMutationErrorMessage(error, 'draft', t);
      toast.error(message);
    },
  });
};
