import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { QUERY_KEYS } from '@/shared/constants';
import type { ApiError } from '@/shared/api';
import type { DashboardNotificationsFeedDto } from '../types';
import {
  markAllDashboardNotificationsRead,
  markDashboardNotificationRead,
} from './dashboard-notifications.commands.api';

export function useMarkDashboardNotificationRead() {
  const client = useQueryClient();
  const { t } = useTranslation();

  return useMutation<boolean, ApiError, string>({
    mutationFn: (id) => markDashboardNotificationRead(id),
    onSuccess: (_data, id) => {
      client.setQueriesData<DashboardNotificationsFeedDto>(
        { queryKey: QUERY_KEYS.dashboardNotifications },
        (current) => {
          if (!current) return current;
          const target = current.items.find((item) => item.id === id);
          const wasUnread = target && !target.isRead;
          return {
            ...current,
            items: current.items.map((item) => (item.id === id ? { ...item, isRead: true } : item)),
            unreadCount: wasUnread ? Math.max(0, current.unreadCount - 1) : current.unreadCount,
          };
        },
      );
      void client.invalidateQueries({ queryKey: QUERY_KEYS.dashboardNotifications });
    },
    onError: (error) => {
      toast.error(error.message.startsWith('errors.') ? t(error.message) : error.message);
    },
  });
}

export function useMarkAllDashboardNotificationsRead() {
  const client = useQueryClient();
  const { t } = useTranslation();

  return useMutation<number, ApiError, void>({
    mutationFn: () => markAllDashboardNotificationsRead(),
    onSuccess: () => {
      client.setQueriesData<DashboardNotificationsFeedDto>(
        { queryKey: QUERY_KEYS.dashboardNotifications },
        (current) => {
          if (!current) return current;
          return {
            ...current,
            items: current.items.map((item) => ({ ...item, isRead: true })),
            unreadCount: 0,
          };
        },
      );
      void client.invalidateQueries({ queryKey: QUERY_KEYS.dashboardNotifications });
    },
    onError: (error) => {
      toast.error(error.message.startsWith('errors.') ? t(error.message) : error.message);
    },
  });
}
