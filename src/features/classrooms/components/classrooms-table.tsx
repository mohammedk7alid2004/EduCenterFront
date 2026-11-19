import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { PERMISSIONS } from '@/config';
import { usePermission } from '@/infrastructure/auth';
import { useOnline } from '@/shared/hooks';
import {
  DataTable,
  RowActions,
  StatusSwitch,
  useConfirm,
  useAuditColumns,
  type Column,
} from '@/shared/components';
import type { ClassroomDto } from '../classrooms.types';
import { useDeleteClassrooms, useToggleClassroomStatus } from '../classrooms.queries';
export function ClassroomsTable({
  rows,
  onView,
  onEdit,
}: {
  rows: ClassroomDto[];
  onView: (row: ClassroomDto) => void;
  onEdit: (row: ClassroomDto) => void;
}): JSX.Element {
  const { t, i18n } = useTranslation();
  const language = i18n.language.startsWith('ar') ? 'ar' : 'en';
  const can = usePermission();
  const online = useOnline();
  const remove = useDeleteClassrooms();
  const toggle = useToggleClassroomStatus();
  const { confirm, dialog } = useConfirm();
  const auditColumns = useAuditColumns<ClassroomDto>();
  function deleteSelection(ids: string[]) {
    confirm({
      title: t('classrooms.delete.title'),
      description: t('common.deleteSelection', { count: ids.length }),
      onConfirm: () => remove.mutateAsync(ids),
      successTitle: t('classrooms.delete.title'),
      successDescription: t('classrooms.feedback.deleted'),
    });
  }
  const columns: Column<ClassroomDto>[] = [
    {
      id: 'id',
      header: t('common.id'),
      headerClassName: 'w-28',
      cell: (row) => (
        <span className="block max-w-24 truncate" title={row.id}>
          #<bdi>{row.id}</bdi>
        </span>
      ),
    },
    {
      id: 'name',
      header: t('classrooms.form.name'),
      headerClassName: 'min-w-48',
      cell: (row) => (
        <button type="button" className="text-start hover:text-primary" onClick={() => onView(row)}>
          {row.name[language] || row.name.en || row.name.ar || t('common.noValue')}
        </button>
      ),
    },
    {
      id: 'capacity',
      header: t('classrooms.form.capacity'),
      headerClassName: 'min-w-36',
      cell: (row) => t('classrooms.capacityPeople', { count: row.capacity }),
    },
    {
      id: 'notes',
      header: t('classrooms.form.notes'),
      headerClassName: 'min-w-64',
      cell: (row) => (
        <span
          className="block max-w-80 truncate"
          title={row.note[language] || row.note.en || row.note.ar || undefined}
        >
          {row.note[language] || row.note.en || row.note.ar || t('common.noValue')}
        </span>
      ),
    },
    ...auditColumns,
    {
      id: 'status',
      header: t('common.status'),
      headerClassName: 'min-w-36',
      cell: (row) => (
        <StatusSwitch
          active={row.isActive}
          disabled={
            !online ||
            toggle.isPending ||
            remove.isPending ||
            !can(PERMISSIONS.classrooms.toggleStatus)
          }
          onChange={() =>
            toggle.mutate(row.id, {
              onError: (error) => toast.error(t(error.message, { defaultValue: error.message })),
            })
          }
        />
      ),
    },
    {
      id: 'actions',
      header: t('common.actions'),
      headerClassName: 'w-44',
      cell: (row) => (
        <RowActions
          onView={() => onView(row)}
          onEdit={() => onEdit(row)}
          onDelete={() => deleteSelection([row.id])}
          disabled={!online || remove.isPending || toggle.isPending}
          canEdit={can(PERMISSIONS.classrooms.update)}
          canDelete={can(PERMISSIONS.classrooms.delete)}
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
        pending={!online || remove.isPending || toggle.isPending}
        onDeleteSelected={can(PERMISSIONS.classrooms.delete) ? deleteSelection : undefined}
      />
    </>
  );
}
