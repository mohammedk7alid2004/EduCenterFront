import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PERMISSIONS } from '@/app/config';
import { ROUTES } from '@/shared/constants';
import { Icon } from '@/shared/components';
import { useAuthStore, useOnline, usePermission } from '@/shared/hooks';
import {
  useMarkAllDashboardNotificationsRead,
  useMarkDashboardNotificationRead,
} from '../commands';
import { DASHBOARD_NOTIFICATION_PAGE_SIZE } from '../constants';
import { useDashboardNotifications, useDashboardNotificationsRealtime } from '../queries';
import type { DashboardNotificationDto } from '../types';
import {
  formatNotificationTime,
  resolveNotificationMessage,
  resolveNotificationRoute,
  resolveNotificationTitle,
} from '../utils';

export function DashboardNotificationsBell(): JSX.Element {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const can = usePermission();
  const isOnline = useOnline();
  const accessToken = useAuthStore((state) => state.accessToken);
  const enabled = Boolean(accessToken);

  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const hubStatus = useDashboardNotificationsRealtime(enabled);
  const query = useDashboardNotifications(1, DASHBOARD_NOTIFICATION_PAGE_SIZE, enabled);
  const markRead = useMarkDashboardNotificationRead();
  const markAllRead = useMarkAllDashboardNotificationsRead();

  const items = query.data?.items ?? [];
  const unreadCount = query.data?.unreadCount ?? 0;

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  function handleItemClick(item: DashboardNotificationDto) {
    if (!item.isRead && !markRead.isPending) {
      markRead.mutate(item.id);
    }

    const route = resolveNotificationRoute(item);
    if (!route) return;

    const allowed =
      (route === ROUTES.students && can(PERMISSIONS.students.read)) ||
      (route === ROUTES.contactUs && can(PERMISSIONS.contactUs.read));

    if (allowed) {
      setOpen(false);
      navigate(route);
    }
  }

  const statusColor = !isOnline
    ? 'bg-muted'
    : hubStatus === 'connected'
      ? 'bg-success'
      : hubStatus === 'reconnecting' || hubStatus === 'connecting'
        ? 'bg-warning'
        : 'bg-muted';

  const statusLabel = !isOnline
    ? t('dashboardNotifications.offline')
    : hubStatus === 'connected'
      ? t('dashboardNotifications.liveConnected')
      : hubStatus === 'reconnecting' || hubStatus === 'connecting'
        ? t('dashboardNotifications.reconnecting')
        : t('dashboardNotifications.offline');

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label={t('common.notifications')}
        aria-expanded={open}
        title={t('common.notifications')}
        className="header-control relative -ms-2 flex h-[34px] w-[52px] items-center justify-center rounded-[10px] bg-card transition hover:bg-card/80"
      >
        <img
          src="/images/dashboard/notification.png"
          alt=""
          className="h-[30px] w-[34px] object-contain"
        />
        {unreadCount > 0 && (
          <span
            aria-label={t('dashboardNotifications.unreadBadge', { count: unreadCount })}
            className="absolute -end-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-card shadow-sm"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          role="region"
          aria-label={t('dashboardNotifications.title')}
          className="absolute end-0 top-full z-30 mt-2 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-border bg-card shadow-xl sm:w-96"
        >
          <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
            <div className="flex min-w-0 items-center gap-2">
              <Icon name="bell" className="size-4 shrink-0 text-primary" />
              <h3 className="truncate text-sm font-semibold text-foreground">
                {t('dashboardNotifications.title')}
              </h3>
              <span
                title={statusLabel}
                className="inline-flex items-center gap-1 rounded-full bg-subtle px-2 py-0.5 text-[10px] font-medium text-tableHeading"
              >
                <span className={`size-1.5 rounded-full ${statusColor}`} />
                {statusLabel}
              </span>
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => markAllRead.mutate()}
                disabled={markAllRead.isPending}
                className="shrink-0 text-xs font-medium text-primary hover:underline disabled:opacity-50"
              >
                {markAllRead.isPending
                  ? t('common.loading')
                  : t('dashboardNotifications.markAllRead')}
              </button>
            )}
          </div>

          {!isOnline && (
            <div className="border-b border-border bg-warning/10 px-4 py-2 text-xs text-warning">
              {t('errors.network')}
            </div>
          )}

          <div className="max-h-96 overflow-y-auto divide-y divide-border/60">
            {query.isPending ? (
              <div className="space-y-2 p-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="h-14 animate-pulse rounded-xl bg-iconSurface/60" />
                ))}
              </div>
            ) : query.isError ? (
              <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
                <p className="text-xs text-danger">
                  {query.error.message.startsWith('errors.')
                    ? t(query.error.message)
                    : t('dashboardNotifications.loadError')}
                </p>
                <button
                  type="button"
                  onClick={() => void query.refetch()}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-primary hover:bg-subtle"
                >
                  <Icon name="resend" className="size-3.5" />
                  {t('common.retry')}
                </button>
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-4 py-10 text-center text-muted">
                <Icon name="bell" className="size-7 opacity-40" />
                <p className="text-xs">{t('common.noNotifications')}</p>
              </div>
            ) : (
              items.map((item) => {
                const title = resolveNotificationTitle(item, i18n.language, t);
                const message = resolveNotificationMessage(item, i18n.language);
                const timestamp = formatNotificationTime(item.createdAt, i18n.language);
                const route = resolveNotificationRoute(item);
                const itemIcon = route === ROUTES.contactUs ? 'mail' : 'students';

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleItemClick(item)}
                    className={`flex w-full items-start gap-3 px-4 py-3 text-start transition hover:bg-subtle/70 ${
                      item.isRead ? 'opacity-75' : 'bg-primary/5'
                    }`}
                  >
                    <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                      <Icon name={itemIcon} className="size-4" />
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="truncate text-xs font-semibold text-foreground">{title}</p>
                        {!item.isRead && (
                          <span
                            aria-label={t('dashboardNotifications.markRead')}
                            className="mt-1 size-2 shrink-0 rounded-full bg-primary"
                          />
                        )}
                      </div>
                      <p className="mt-0.5 line-clamp-2 text-xs text-tableHeading">{message}</p>
                      {timestamp && <p className="mt-1 text-[10px] text-muted">{timestamp}</p>}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
