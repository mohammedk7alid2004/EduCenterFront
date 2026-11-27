import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { HubConnectionBuilder, HubConnectionState, LogLevel } from '@microsoft/signalr';
import { toast } from 'sonner';
import { API_ENDPOINTS, QUERY_KEYS } from '@/shared/constants';
import { useAuthStore, useOnline } from '@/shared/hooks';
import { DASHBOARD_NOTIFICATION_EVENT, DASHBOARD_NOTIFICATION_TYPE } from '../constants';
import type {
  DashboardHubStatus,
  DashboardNotificationDto,
  DashboardNotificationsFeedDto,
} from '../types';
import {
  playNotificationSound,
  resolveNotificationMessage,
  resolveNotificationTitle,
  unlockNotificationAudio,
} from '../utils';

export function useDashboardNotificationsRealtime(enabled = true): DashboardHubStatus {
  const accessToken = useAuthStore((state) => state.accessToken);
  const isOnline = useOnline();
  const queryClient = useQueryClient();
  const { t, i18n } = useTranslation();
  const [status, setStatus] = useState<DashboardHubStatus>('idle');

  useEffect(() => {
    if (!enabled || !accessToken || !isOnline) {
      setStatus('idle');
      return;
    }

    let disposed = false;
    setStatus('connecting');
    unlockNotificationAudio();

    const connection = new HubConnectionBuilder()
      .withUrl(API_ENDPOINTS.dashboardNotifications.hub, {
        accessTokenFactory: () => useAuthStore.getState().accessToken ?? '',
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(LogLevel.Warning)
      .build();

    connection.on(DASHBOARD_NOTIFICATION_EVENT, (incoming: DashboardNotificationDto) => {
      if (disposed) return;

      queryClient.setQueriesData<DashboardNotificationsFeedDto>(
        { queryKey: QUERY_KEYS.dashboardNotifications },
        (current) => {
          if (!current) return current;
          if (current.items.some((item) => item.id === incoming.id)) return current;
          return {
            ...current,
            items: [incoming, ...current.items].slice(0, Math.max(current.items.length, 15)),
            unreadCount: incoming.isRead ? current.unreadCount : current.unreadCount + 1,
            totalCount: current.totalCount + 1,
          };
        },
      );

      if (incoming.type === DASHBOARD_NOTIFICATION_TYPE.newStudent) {
        void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.students });
      }

      const activeLang = i18n.resolvedLanguage ?? i18n.language;
      playNotificationSound();
      toast.info(resolveNotificationTitle(incoming, activeLang, t), {
        description: resolveNotificationMessage(incoming, activeLang),
        duration: 6000,
      });
    });

    connection.onreconnecting(() => {
      if (!disposed) setStatus('reconnecting');
    });

    connection.onreconnected(() => {
      if (disposed) return;
      setStatus('connected');
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboardNotifications });
    });

    connection.onclose(() => {
      if (!disposed) setStatus('idle');
    });

    void connection
      .start()
      .then(() => {
        if (disposed) {
          if (connection.state !== HubConnectionState.Disconnected) {
            void connection.stop();
          }
          return;
        }
        setStatus('connected');
      })
      .catch(() => {
        if (!disposed) setStatus('error');
      });

    return () => {
      disposed = true;
      void connection.stop();
    };
  }, [enabled, accessToken, isOnline, queryClient, i18n, t]);

  return status;
}
