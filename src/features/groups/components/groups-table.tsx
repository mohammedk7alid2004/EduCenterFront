import { useTranslation } from 'react-i18next';
import { PERMISSIONS } from '@/config';
import { usePermission } from '@/infrastructure/auth';
import { DataTable, Icon, type Column } from '@/shared/components';
import { groupLocalizedName } from '../groups.lib';
import type { GroupDto } from '../groups.types';
import { GroupStatusBadge } from './group-status-badge';

export function GroupsTable({
  rows,
  startIndex,
  pending,
  onView,
  onConnect,
  onDelete,
  onDeleteSelected,
}: {
  rows: GroupDto[];
  startIndex?: number;
  pending: boolean;
  onView: (row: GroupDto) => void;
  onConnect: (row: GroupDto) => void;
  onDelete: (row: GroupDto) => void;
  onDeleteSelected?: (ids: string[]) => void;
}): JSX.Element {
  const { t, i18n } = useTranslation();
  const can = usePermission();

  const columns: Column<GroupDto>[] = [
    {
      id: 'index',
      header: t('common.index'),
      headerClassName: 'w-16',
      cell: (_row, index) => <span className="font-medium text-muted">{index + 1}</span>,
    },
    {
      id: 'groupName',
      header: t('groups.groupName'),
      headerClassName: 'min-w-36',
      cell: (row) =>
        can(PERMISSIONS.groups.detail) ? (
          <button
            type="button"
            className="font-medium text-start hover:text-primary"
            onClick={() => onView(row)}
          >
            {row.groupName}
          </button>
        ) : (
          row.groupName
        ),
    },
    {
      id: 'subject',
      header: t('groups.subject'),
      cell: (row) => groupLocalizedName(row.subject, i18n.language) || t('common.noValue'),
    },
    {
      id: 'noOfStudents',
      header: t('groups.noOfStudents'),
      cell: (row) => t('groups.studentCount', { count: row.studentsCount ?? 0 }),
    },
    {
      id: 'level',
      header: t('groups.level'),
      cell: (row) =>
        groupLocalizedName(row.levelName, i18n.language) || row.level || t('common.noValue'),
    },
    {
      id: 'grade',
      header: t('groups.grade'),
      cell: (row) =>
        groupLocalizedName(row.gradeName, i18n.language) || row.grade || t('common.noValue'),
    },
    {
      id: 'maxCapacity',
      header: t('groups.maxCapacity'),
      cell: (row) => t('groups.personCount', { count: row.maxCapacity }),
    },
    {
      id: 'status',
      header: t('groups.status'),
      cell: (row) => <GroupStatusBadge status={row.status} />,
    },
    {
      id: 'actions',
      header: t('common.actions'),
      cell: (row) => (
        <div className="flex items-center gap-3">
          {can(PERMISSIONS.groups.detail) && (
            <button
              type="button"
              onClick={() => onView(row)}
              aria-label={t('common.view')}
              title={t('groups.viewTitle')}
              className="grid size-14 place-items-center rounded-xl bg-success/10 text-success transition hover:bg-success/20"
            >
              <Icon name="eye" className="size-7" />
            </button>
          )}
          {can(PERMISSIONS.groups.connectStudents) && (
            <button
              type="button"
              onClick={() => onConnect(row)}
              aria-label={t('groups.connectTitle')}
              title={t('groups.connectTitle')}
              className="grid size-14 place-items-center rounded-xl bg-info/15 text-info transition hover:bg-info/25"
            >
              <Icon name="userRoundPlus" className="size-7" />
            </button>
          )}
          {can(PERMISSIONS.groups.delete) && (
            <button
              type="button"
              disabled={pending}
              onClick={() => onDelete(row)}
              aria-label={t('common.delete')}
              title={t('groups.delete.title')}
              className="grid size-14 place-items-center rounded-xl bg-danger/10 text-danger transition hover:bg-danger/20 disabled:opacity-50"
            >
              <Icon name="trash" className="size-7" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={rows}
      startIndex={startIndex}
      pending={pending}
      onDeleteSelected={can(PERMISSIONS.groups.delete) ? onDeleteSelected : undefined}
    />
  );
}
