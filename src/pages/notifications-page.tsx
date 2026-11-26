import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { LIST_PARAMS } from '@/shared/constants';
import { PERMISSIONS } from '@/app/config';
import { usePermission } from '@/shared/hooks';
import { useListControls } from '@/shared/hooks';
import { ManagementList } from '@/shared/components';
import {
  useNotifications,
  NOTIFICATION_FILTER_PARAMS,
  NOTIFICATION_TYPE,
  NotificationFilters,
  NotificationsTable,
  NotificationFormModal,
  ViewNotificationModal,
} from '@/features/notifications';
import type { NotificationDto } from '@/features/notifications';

export function NotificationsPage(): JSX.Element {
  const { t } = useTranslation();
  const controls = useListControls();
  const [params, setParams] = useSearchParams();
  const can = usePermission();

  const type =
    Object.values(NOTIFICATION_TYPE)
      .map(String)
      .find((value) => value === params.get(NOTIFICATION_FILTER_PARAMS.type)) ?? '';
  const group = params.get(NOTIFICATION_FILTER_PARAMS.group) ?? '';
  const level = params.get(NOTIFICATION_FILTER_PARAMS.level) ?? '';
  const grade = level ? (params.get(NOTIFICATION_FILTER_PARAMS.grade) ?? '') : '';

  const filters = {
    ...controls.filters,
    type: type ? Number(type) : undefined,
    groupId: group || undefined,
    levelId: level || undefined,
    gradeId: grade || undefined,
  };

  const query = useNotifications(filters);
  const [editing, setEditing] = useState<NotificationDto | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [viewing, setViewing] = useState<NotificationDto | null>(null);

  function changeFilter(key: keyof typeof NOTIFICATION_FILTER_PARAMS, value: string) {
    setParams((current) => {
      const next = new URLSearchParams(current);
      if (value) next.set(NOTIFICATION_FILTER_PARAMS[key], value);
      else next.delete(NOTIFICATION_FILTER_PARAMS[key]);
      next.delete(LIST_PARAMS.page);
      if (key === 'level') next.delete(NOTIFICATION_FILTER_PARAMS.grade);
      return next;
    });
  }

  return (
    <>
      <ManagementList
        title={t('notifications.title')}
        description={t('notifications.description')}
        createLabel={t('notifications.create')}
        controls={controls}
        statusFilter={false}
        canCreate={can(PERMISSIONS.notifications.create)}
        totalCount={query.data?.totalCount ?? 0}
        totalPages={Math.max(1, query.data?.totalPages ?? 1)}
        loading={query.isPending}
        fetching={query.isFetching}
        error={query.error}
        onRetry={() => void query.refetch()}
        onCreate={() => {
          setEditing(null);
          setFormOpen(true);
        }}
        filterContent={
          <NotificationFilters
            type={type}
            group={group}
            level={level}
            grade={grade}
            onChange={changeFilter}
            onClear={() =>
              setParams((current) => {
                const next = new URLSearchParams(current);
                for (const key of Object.values(NOTIFICATION_FILTER_PARAMS)) next.delete(key);
                next.delete(LIST_PARAMS.page);
                return next;
              })
            }
          />
        }
      >
        <NotificationsTable
          rows={query.data?.items ?? []}
          startIndex={(controls.page - 1) * controls.pageSize}
          onView={setViewing}
          onEdit={(notification) => {
            setEditing(notification);
            setFormOpen(true);
          }}
        />
      </ManagementList>
      {formOpen && (
        <NotificationFormModal notification={editing} onClose={() => setFormOpen(false)} />
      )}
      {viewing && <ViewNotificationModal id={viewing.id} onClose={() => setViewing(null)} />}
    </>
  );
}
