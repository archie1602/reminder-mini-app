import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { remindersApi } from '@/api/reminders';
import { CreateReminderDto, UpdateReminderDto } from '@/api/types';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

export const REMINDERS_QUERY_KEY = ['reminders'];

export const useReminders = () => {
  return useQuery({
    queryKey: REMINDERS_QUERY_KEY,
    queryFn: remindersApi.getAll,
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
