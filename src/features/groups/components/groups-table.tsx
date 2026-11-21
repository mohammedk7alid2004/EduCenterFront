import { useTranslation } from 'react-i18next';
import { PERMISSIONS } from '@/config';
import { usePermission } from '@/infrastructure/auth';
import { DataTable, Icon, type Column } from '@/shared/components';
import { groupLocalizedName } from '../groups.lib';
import type { GroupDto } from '../groups.types';

export function GroupsTable({
  rows,
  pending,
  onView,
  onConnect,
  onDelete,
  onDeleteSelected,
}: {
  rows: GroupDto[];
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
      id: 'id',
      header: t('common.id'),
      cell: (row) => (
        <span className="block max-w-24 truncate" title={row.id}>
          #<bdi>{row.id.slice(0, 6)}</bdi>
        </span>
      ),
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
      cell: (row) => (
        <span className="font-medium text-primary">
          {t('groups.studentCount', { count: row.studentsCount ?? 0 })}
        </span>
      ),
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
      cell: (row) => (
        <span
          className={`inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-medium ${
            row.isActive
              ? 'border-emerald-500/40 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400'
              : 'border-rose-500/40 bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400'
          }`}
        >
          {t(row.isActive ? 'groups.active' : 'groups.deactivated')}
        </span>
      ),
    },
    {
      id: 'actions',
      header: t('common.actions'),
      cell: (row) => (
        <div className="flex items-center gap-2">
          {can(PERMISSIONS.groups.detail) && (
            <button
              type="button"
              onClick={() => onView(row)}
              aria-label={t('common.view')}
              title={t('groups.viewTitle')}
              className="grid size-[38px] place-items-center rounded-lg bg-success/10 text-success transition hover:bg-success/20"
            >
              <Icon name="eye" className="size-5" />
            </button>
          )}
          {can(PERMISSIONS.groups.connectStudents) && (
            <button
              type="button"
              onClick={() => onConnect(row)}
              aria-label={t('groups.connectTitle')}
              title={t('groups.connectTitle')}
              className="grid size-[38px] place-items-center rounded-lg bg-primary/10 text-primary transition hover:bg-primary/20"
            >
              <Icon name="link" className="size-5" />
            </button>
          )}
          {can(PERMISSIONS.groups.delete) && (
            <button
              type="button"
              disabled={pending}
              onClick={() => onDelete(row)}
              aria-label={t('common.delete')}
              title={t('groups.delete.title')}
              className="grid size-[38px] place-items-center rounded-lg bg-danger/10 text-danger transition hover:bg-danger/20 disabled:opacity-50"
            >
              <Icon name="trash" className="size-5" />
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
      pending={pending}
      onDeleteSelected={can(PERMISSIONS.groups.delete) ? onDeleteSelected : undefined}
    />
  );
}
