import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/shared/constants';
import type { ApiError } from '@/shared/api';
import type { PaginatedResult } from '@/shared/types';
import {
  fetchNotifications,
  fetchNotification,
  fetchNotificationGroups,
  fetchNotificationLevels,
  fetchNotificationGrades,
} from './notifications.queries.api';
import type {
  NotificationDto,
  NotificationFilters,
  NotificationGroupOption,
  NotificationSelectOption,
} from '../types';

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
