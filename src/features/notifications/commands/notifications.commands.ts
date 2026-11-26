import { useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/shared/constants';
import type { ApiError } from '@/shared/api';
import type { NotificationValues } from '../types';
import {
  createNotification,
  updateNotification,
  deleteNotifications,
  resendNotification,
} from './notifications.commands.api';

export function useCreateNotification() {
  const client = useQueryClient();
  return useMutation<void, ApiError, NotificationValues>({
    mutationFn: (values) => createNotification(values),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: QUERY_KEYS.notifications });
    },
  });
}

export function useUpdateNotification(id: string) {
  const client = useQueryClient();
  return useMutation<void, ApiError, NotificationValues>({
    mutationFn: (values) => updateNotification(id, values),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: QUERY_KEYS.notifications });
    },
  });
}

export function useDeleteNotifications() {
  const client = useQueryClient();
  return useMutation<void, ApiError, string[]>({
    mutationFn: (ids) => deleteNotifications(ids),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: QUERY_KEYS.notifications });
    },
  });
}

export function useResendNotification() {
  const client = useQueryClient();
  return useMutation<void, ApiError, string>({
    mutationFn: (id) => resendNotification(id),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: QUERY_KEYS.notifications });
    },
  });
}
