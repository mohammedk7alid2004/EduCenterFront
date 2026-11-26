import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/config';
import type { ApiError, PaginatedResult } from '@/infrastructure/api';
import {
  fetchNotifications,
  fetchNotification,
  createNotification,
  updateNotification,
  deleteNotifications,
  resendNotification,
  fetchNotificationGroups,
  fetchNotificationLevels,
  fetchNotificationGrades,
} from './notifications.api';
import type {
  NotificationDto,
  NotificationFilters,
  NotificationValues,
  NotificationGroupOption,
  NotificationSelectOption,
} from './notifications.types';

export function useNotifications(filters: NotificationFilters, enabled = true) {
  const { i18n } = useTranslation();
  return useQuery<PaginatedResult<NotificationDto>, ApiError>({
    queryKey: [...QUERY_KEYS.notifications, i18n.language, filters],
    queryFn: ({ signal }) => fetchNotifications(filters, signal),
    enabled,
  });
}

export function useNotification(id?: string) {
  const { i18n } = useTranslation();
  return useQuery<NotificationDto, ApiError>({
    queryKey: [...QUERY_KEYS.notifications, QUERY_KEYS.detail, i18n.language, id],
    queryFn: ({ signal }) => fetchNotification(id!, signal),
    enabled: Boolean(id),
  });
}

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

export function useNotificationGroups() {
  const { i18n } = useTranslation();
  return useQuery<NotificationGroupOption[], ApiError>({
    queryKey: [...QUERY_KEYS.notifications, QUERY_KEYS.options, 'groups', i18n.language],
    queryFn: ({ signal }) => fetchNotificationGroups(signal),
  });
}

export function useNotificationLevels() {
  const { i18n } = useTranslation();
  return useQuery<NotificationSelectOption[], ApiError>({
    queryKey: [...QUERY_KEYS.notifications, QUERY_KEYS.options, 'levels', i18n.language],
    queryFn: ({ signal }) => fetchNotificationLevels(signal),
  });
}

export function useNotificationGrades(levelId?: string) {
  const { i18n } = useTranslation();
  return useQuery<NotificationSelectOption[], ApiError>({
    queryKey: [...QUERY_KEYS.notifications, QUERY_KEYS.options, 'grades', i18n.language, levelId],
    queryFn: ({ signal }) => fetchNotificationGrades(levelId, signal),
    enabled: Boolean(levelId),
  });
}
