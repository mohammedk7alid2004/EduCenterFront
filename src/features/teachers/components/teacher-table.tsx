import { useTranslation } from 'react-i18next';
import { DataTable, StatusSwitch, useConfirm, type Column } from '@/shared/ui';
import { useOnline } from '@/shared/lib';
import { toast } from 'sonner';
import type { TeacherDto } from '../teachers.types';
import { useDeleteTeachers, useToggleTeacherStatus } from '../teachers.queries';
import { TeacherRowActions } from './teacher-row-actions';
export function TeacherTable({
  rows,
  onEdit,
  onView,
}: {
  rows: TeacherDto[];
  onEdit: (row: TeacherDto) => void;
  onView: (row: TeacherDto) => void;
}): JSX.Element {
  const { t, i18n } = useTranslation();
  const lang = i18n.language.startsWith('ar') ? 'ar' : 'en';
  const online = useOnline();
  const { confirm, dialog } = useConfirm();
  const remove = useDeleteTeachers();
  const toggle = useToggleTeacherStatus();
  const columns: Column<TeacherDto>[] = [
    {
      id: 'id',
      headerClassName: 'w-28',
      header: t('common.id'),
      cell: (row) => (
        <span className="block max-w-24 truncate" title={row.id}>
          #{row.id}
        </span>
      ),
    },
    {
      id: 'name',
      headerClassName: 'w-48',
      header: t('teachers.form.fullName'),
      cell: (row) => (
        <button type="button" className="text-start hover:text-primary" onClick={() => onView(row)}>
          {row.name}
        </button>
      ),
    },
    {
      id: 'phone',
      headerClassName: 'w-48',
      header: t('teachers.form.phone'),
      cell: (row) => <bdi>{row.phoneNumber || t('common.noValue')}</bdi>,
    },
    {
      id: 'email',
      headerClassName: 'w-64',
      header: t('teachers.form.email'),
      cell: (row) => <bdi title={row.email}>{row.email}</bdi>,
    },
    {
      id: 'subjects',
      headerClassName: 'w-48',
      header: t('teachers.form.subjects'),
      cell: (row) =>
        row.subjects
          .map((subject) => subject.name[lang] || subject.name.en || subject.name.ar)
          .filter(Boolean)
          .join(' - ') || t('common.noValue'),
    },
    {
      id: 'notes',
      headerClassName: 'w-48',
      header: t('teachers.form.notes'),
      cell: (row) => (
        <span className="block max-w-64 truncate" title={row.notes ?? undefined}>
          {row.notes || t('common.noValue')}
        </span>
      ),
    },
    {
      id: 'status',
      headerClassName: 'w-40',
      header: t('common.status'),
      cell: (row) => (
        <StatusSwitch
          active={row.isActive}
          disabled={!online || toggle.isPending}
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
      headerClassName: 'w-52',
      header: t('common.actions'),
      cell: (row) => (
        <TeacherRowActions
          teacher={row}
          onEdit={onEdit}
          onView={onView}
          pending={remove.isPending}
          onDelete={(item) =>
            confirm({
              title: t('teachers.delete.confirmTitle'),
              description: t('teachers.delete.confirmDescription'),
              onConfirm: () => remove.mutateAsync({ ids: [item.id] }),
              successTitle: t('teachers.delete.confirmTitle'),
              successDescription: t('teachers.feedback.deleted'),
            })
          }
        />
      ),
    },
  ];
  return (
    <>
      {dialog}
      <DataTable
        className="[&_table]:min-w-[1792px]"
        columns={columns}
        rows={rows}
        pending={!online || remove.isPending}
        onDeleteSelected={(ids) =>
          confirm({
            title: t('teachers.delete.bulkTitle'),
            description: t('common.deleteSelection', { count: ids.length }),
            onConfirm: () => remove.mutateAsync({ ids }),
            successTitle: t('teachers.delete.bulkTitle'),
            successDescription: t('teachers.feedback.deleted'),
          })
        }
      />
    </>
  );
}
