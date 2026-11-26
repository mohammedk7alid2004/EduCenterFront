import { useTranslation } from 'react-i18next';
import { PERMISSIONS } from '@/app/config';
import { usePermission } from '@/shared/hooks';
import { DataTable, Icon, type Column } from '@/shared/components';
import type { AttendanceDto } from '../types';
import { AttendanceStatusBadge } from './attendance-status-badge';
export function AttendanceTable({
  rows,
  startIndex,
  onView,
}: {
  rows: AttendanceDto[];
  startIndex?: number;
  onView: (row: AttendanceDto) => void;
}): JSX.Element {
  const { t } = useTranslation();
  const can = usePermission();
  const columns: Column<AttendanceDto>[] = [
    {
      id: 'index',
      header: t('common.index'),
      headerClassName: 'w-16',
      cell: (_row, index) => <span className="font-medium text-muted">{index + 1}</span>,
    },
    {
      id: 'fullName',
      header: t('attendance.fullName'),
      cell: (row) =>
        can(PERMISSIONS.attendance.detail) ? (
          <button
            type="button"
            className="text-start hover:text-primary"
            onClick={() => onView(row)}
          >
            {row.fullName}
          </button>
        ) : (
          row.fullName
        ),
    },
    {
      id: 'phoneNumber',
      header: t('attendance.phoneNumber'),
      cell: (row) => <bdi>{row.phoneNumber || t('common.noValue')}</bdi>,
    },
    {
      id: 'email',
      header: t('attendance.email'),
      cell: (row) => <bdi>{row.email || t('common.noValue')}</bdi>,
    },
    {
      id: 'group',
      header: t('attendance.group'),
      cell: (row) => row.groupName || t('common.noValue'),
    },
    {
      id: 'status',
      header: t('attendance.status'),
      cell: (row) => <AttendanceStatusBadge status={row.status} />,
    },
    {
      id: 'actions',
      header: t('common.actions'),
      cell: (row) =>
        can(PERMISSIONS.attendance.detail) ? (
          <button
            type="button"
            onClick={() => onView(row)}
            aria-label={t('common.view')}
            className="grid size-10 place-items-center rounded-xl bg-success/10 text-success transition hover:bg-success/20"
          >
            <Icon name="eye" className="size-5" />
          </button>
        ) : null,
    },
  ];
  return <DataTable columns={columns} rows={rows} startIndex={startIndex} pending={false} />;
}
