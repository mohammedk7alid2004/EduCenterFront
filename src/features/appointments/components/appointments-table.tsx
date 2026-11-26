import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { PERMISSIONS } from '@/config';
import { usePermission } from '@/infrastructure/auth';
import { useOnline } from '@/shared/hooks';
import {
  DataTable,
  RowActions,
  useAuditColumns,
  useConfirm,
  type Column,
} from '@/shared/components';
import { useDeleteAppointments, useSetAppointmentStatus } from '../appointments.queries';
import { APPOINTMENT_STATUS, APPOINTMENT_ITERATION } from '../appointments.constants';
import { localizedName, formatAppointmentTime } from '../appointments.lib';
import type { AppointmentDto } from '../appointments.types';
export function AppointmentsTable({
  rows,
  startIndex,
  onView,
  onEdit,
}: {
  rows: AppointmentDto[];
  startIndex?: number;
  onView: (row: AppointmentDto) => void;
  onEdit: (row: AppointmentDto) => void;
}): JSX.Element {
  const { t, i18n } = useTranslation();
  const can = usePermission();
  const online = useOnline();
  const remove = useDeleteAppointments();
  const status = useSetAppointmentStatus();
  const { confirm, dialog } = useConfirm();
  const audits = useAuditColumns<AppointmentDto>();
  const pending = !online || remove.isPending || status.isPending;
  const deleteSelection = (ids: string[]) =>
    confirm({
      title: t('appointments.deleteTitle'),
      description: t('common.deleteSelection', { count: ids.length }),
      onConfirm: () => remove.mutateAsync(ids),
      successTitle: t('appointments.deleteTitle'),
      successDescription: t('appointments.deleted'),
    });
  const columns: Column<AppointmentDto>[] = [
    {
      id: 'index',
      header: t('common.index'),
      headerClassName: 'w-16',
      cell: (_row, index) => <span className="font-medium text-muted">{index + 1}</span>,
    },
    {
      id: 'groupName',
      header: t('appointments.fields.groupName'),
      headerClassName: 'min-w-44',
      cell: (row) =>
        can(PERMISSIONS.appointments.detail) ? (
          <button className="text-start hover:text-primary" onClick={() => onView(row)}>
            {row.groupName}
          </button>
        ) : (
          row.groupName
        ),
    },
    {
      id: 'subject',
      header: t('appointments.fields.subject'),
      headerClassName: 'min-w-40',
      cell: (row) => localizedName(row.subject, i18n.language),
    },
    {
      id: 'teacher',
      header: t('appointments.fields.teacher'),
      headerClassName: 'min-w-48',
      cell: (row) => row.teacher,
    },
    {
      id: 'maxCapacity',
      header: t('appointments.fields.maxCapacity'),
      cell: (row) => row.maxCapacity,
    },
    {
      id: 'classroom',
      header: t('appointments.fields.classroom'),
      headerClassName: 'min-w-36',
      cell: (row) => localizedName(row.classroom, i18n.language),
    },
    {
      id: 'time',
      header: t('appointments.time'),
      headerClassName: 'min-w-48',
      cell: (row) => (
        <bdi>
          {formatAppointmentTime(row.startTime, i18n.language)} –{' '}
          {formatAppointmentTime(row.endTime, i18n.language)}
        </bdi>
      ),
    },
    {
      id: 'days',
      header: t('appointments.fields.days'),
      headerClassName: 'min-w-48',
      cell: (row) =>
        row.days.map((day) => t(`appointments.days.${day}`)).join(t('appointments.separator')),
    },
    {
      id: 'iteration',
      header: t('appointments.fields.iteration'),
      cell: (row) =>
        t(
          `appointments.iterations.${Object.entries(APPOINTMENT_ITERATION).find(([, value]) => value === row.iteration)?.[0]}`,
        ),
    },
    ...audits,
    {
      id: 'status',
      header: t('common.status'),
      headerClassName: 'min-w-40',
      cell: (row) => (
        <select
          aria-label={t('appointments.changeStatus', { name: row.groupName })}
          value={row.status}
          disabled={pending || !can(PERMISSIONS.appointments.toggleStatus)}
          onChange={(event) =>
            status.mutate(
              { id: row.id, status: Number(event.target.value) },
              {
                onError: (error) => toast.error(t(error.message, { defaultValue: error.message })),
              },
            )
          }
          className={`rounded-full border px-3 py-1.5 text-xs disabled:opacity-70 ${row.status === APPOINTMENT_STATUS.active ? 'border-success/30 bg-success/10 text-success' : 'border-border bg-table text-tableHeading'}`}
        >
          {Object.entries(APPOINTMENT_STATUS).map(([key, value]) => (
            <option key={key} value={value}>
              {t(`appointments.statuses.${key}`)}
            </option>
          ))}
        </select>
      ),
    },
    {
      id: 'actions',
      header: t('common.actions'),
      headerClassName: 'min-w-40',
      cell: (row) => (
        <RowActions
          onView={() => onView(row)}
          onEdit={() => onEdit(row)}
          onDelete={() => deleteSelection([row.id])}
          disabled={pending}
          canView={can(PERMISSIONS.appointments.detail)}
          canEdit={can(PERMISSIONS.appointments.update) && can(PERMISSIONS.appointments.detail)}
          canDelete={can(PERMISSIONS.appointments.delete)}
        />
      ),
    },
  ];
  return (
    <>
      {dialog}
      <DataTable
        rows={rows}
        startIndex={startIndex}
        columns={columns}
        pending={pending}
        onDeleteSelected={can(PERMISSIONS.appointments.delete) ? deleteSelection : undefined}
      />
    </>
  );
}
