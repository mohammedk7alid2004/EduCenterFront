import { useTranslation } from 'react-i18next';
import { PERMISSIONS } from '@/config';
import { usePermission } from '@/infrastructure/auth';
import { useOnline } from '@/shared/hooks';
import { DataTable, Icon, RowActions, useConfirm, type Column } from '@/shared/components';
import { notificationLocalizedName } from '../notifications.lib';
import { NOTIFICATION_TYPE } from '../notifications.constants';
import { useDeleteNotifications, useResendNotification } from '../notifications.queries';
import type { NotificationDto } from '../notifications.types';

export function NotificationsTable({
  rows,
  startIndex,
  onView,
  onEdit,
}: {
  rows: NotificationDto[];
  startIndex?: number;
  onView: (row: NotificationDto) => void;
  onEdit: (row: NotificationDto) => void;
}): JSX.Element {
  const { t, i18n } = useTranslation();
  const can = usePermission();
  const online = useOnline();
  const remove = useDeleteNotifications();
  const resend = useResendNotification();
  const { confirm, dialog } = useConfirm();
  const pending = !online || remove.isPending || resend.isPending;

  const typeName = (type: number) => {
    const entry = Object.entries(NOTIFICATION_TYPE).find(([, v]) => v === type);
    return entry ? t(`notifications.types.${entry[0]}`) : t('common.noValue');
  };

  function deleteSelection(ids: string[]) {
    confirm({
      title: t(
        ids.length === 1 ? 'notifications.delete.singleTitle' : 'notifications.delete.title',
      ),
      description: t(
        ids.length === 1 ? 'notifications.delete.singleDescription' : 'common.deleteSelection',
        { count: ids.length },
      ),
      onConfirm: () => remove.mutateAsync(ids),
      successTitle: t(
        ids.length === 1 ? 'notifications.delete.singleTitle' : 'notifications.delete.title',
      ),
      successDescription: t('notifications.feedback.deleted'),
    });
  }

  function confirmResend(id: string) {
    confirm({
      title: t('notifications.resendConfirm.title'),
      description: t('notifications.resendConfirm.description'),
      variant: 'confirm',
      icon: 'resend',
      onConfirm: () => resend.mutateAsync(id),
      successTitle: t('notifications.resendConfirm.title'),
      successDescription: t('notifications.feedback.resent'),
      successIcon: 'resend',
    });
  }

  const columns: Column<NotificationDto>[] = [
    {
      id: 'id',
      header: t('notifications.fields.id'),
      headerClassName: 'w-24',
      cell: (row) => (
        <span className="font-medium text-muted">
          <bdi>#{row.id.slice(0, 4).toUpperCase()}</bdi>
        </span>
      ),
    },
    {
      id: 'title',
      header: t('notifications.fields.title'),
      headerClassName: 'min-w-36',
      cell: (row) =>
        can(PERMISSIONS.notifications.detail) ? (
          <button
            type="button"
            className="text-start font-medium hover:text-primary"
            onClick={() => onView(row)}
          >
            {row.title}
          </button>
        ) : (
          <span className="font-medium">{row.title}</span>
        ),
    },
    {
      id: 'type',
      header: t('notifications.fields.type'),
      cell: (row) => typeName(row.type),
    },
    {
      id: 'group',
      header: t('notifications.fields.group'),
      headerClassName: 'min-w-36',
      cell: (row) => row.groupName || t('common.noValue'),
    },
    {
      id: 'grade',
      header: t('notifications.fields.grade'),
      headerClassName: 'min-w-32',
      cell: (row) => notificationLocalizedName(row.gradeName, i18n.language) || t('common.noValue'),
    },
    {
      id: 'level',
      header: t('notifications.fields.level'),
      headerClassName: 'min-w-32',
      cell: (row) => notificationLocalizedName(row.levelName, i18n.language) || t('common.noValue'),
    },
    {
      id: 'message',
      header: t('notifications.fields.message'),
      headerClassName: 'min-w-48 max-w-64',
      cell: (row) => (
        <span className="line-clamp-1 max-w-60 text-muted" title={row.message}>
          {row.message || t('common.noValue')}
        </span>
      ),
    },
    {
      id: 'image',
      header: t('notifications.fields.image'),
      cell: (row) =>
        row.imageUrl ? (
          <img
            src={row.imageUrl}
            alt={row.title}
            className="h-9 w-16 rounded-lg border border-border object-cover"
          />
        ) : (
          <span className="text-muted">{t('common.noValue')}</span>
        ),
    },
    {
      id: 'actions',
      header: t('common.actions'),
      cell: (row) => (
        <RowActions
          onView={() => onView(row)}
          onEdit={() => onEdit(row)}
          onDelete={() => deleteSelection([row.id])}
          disabled={pending}
          canView={can(PERMISSIONS.notifications.detail)}
          canEdit={can(PERMISSIONS.notifications.update) && can(PERMISSIONS.notifications.detail)}
          canDelete={can(PERMISSIONS.notifications.delete)}
          extraAction={
            can(PERMISSIONS.notifications.resend) ? (
              <button
                type="button"
                aria-label={t('notifications.resend')}
                title={t('notifications.resend')}
                disabled={pending}
                onClick={() => confirmResend(row.id)}
                className="grid size-[38px] place-items-center rounded-lg bg-iconSurface text-primary transition hover:bg-primary/15 disabled:opacity-50"
              >
                <Icon name="resend" className="size-5" />
              </button>
            ) : undefined
          }
        />
      ),
    },
  ];

  return (
    <>
      {dialog}
      <DataTable
        columns={columns}
        rows={rows}
        startIndex={startIndex}
        pending={pending}
        onDeleteSelected={can(PERMISSIONS.notifications.delete) ? deleteSelection : undefined}
      />
    </>
  );
}
