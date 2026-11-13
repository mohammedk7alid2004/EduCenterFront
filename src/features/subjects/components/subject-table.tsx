import { useTranslation } from 'react-i18next';
import { DataTable, StatusSwitch, useConfirm, type Column } from '@/shared/ui';
import { useOnline } from '@/shared/lib';
import { toast } from 'sonner';
import type { SubjectDto } from '../subjects.types';
import { useDeleteSubjects, useToggleSubjectStatus } from '../subjects.queries';
import { SubjectRowActions } from './subject-row-actions';
export function SubjectTable({
  rows,
  onEdit,
  onView,
}: {
  rows: SubjectDto[];
  onEdit: (row: SubjectDto) => void;
  onView: (row: SubjectDto) => void;
}): JSX.Element {
  const { t, i18n } = useTranslation();
  const lang = i18n.language.startsWith('ar') ? 'ar' : 'en';
  const online = useOnline();
  const { confirm, dialog } = useConfirm();
  const remove = useDeleteSubjects();
  const toggle = useToggleSubjectStatus();
  const columns: Column<SubjectDto>[] = [
    {
      id: 'id',
      header: t('common.id'),
      cell: (row) => (
        <span className="block max-w-24 truncate" title={row.id}>
          #{row.id}
        </span>
      ),
    },
    {
      id: 'name',
      header: t('subjects.table.name'),
      cell: (row) => (
        <button type="button" className="text-start hover:text-primary" onClick={() => onView(row)}>
          {row.name[lang] || row.name.en || row.name.ar || t('common.noValue')}
        </button>
      ),
    },
    {
      id: 'notes',
      header: t('subjects.table.note'),
      cell: (row) => (
        <span className="block max-w-80 truncate">
          {row.note[lang] || row.note.en || row.note.ar || t('common.noValue')}
        </span>
      ),
    },
    {
      id: 'status',
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
      header: t('common.actions'),
      cell: (row) => (
        <SubjectRowActions
          subject={row}
          onEdit={onEdit}
          onView={onView}
          pending={remove.isPending}
          onDelete={(item) =>
            confirm({
              title: t('subjects.delete.confirmTitle'),
              description: t('subjects.delete.confirmDescription'),
              onConfirm: () => remove.mutateAsync({ ids: [item.id] }),
              successTitle: t('subjects.delete.confirmTitle'),
              successDescription: t('subjects.feedback.deleted'),
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
        columns={columns}
        rows={rows}
        pending={!online || remove.isPending}
        onDeleteSelected={(ids) =>
          confirm({
            title: t('subjects.delete.bulkTitle'),
            description: t('common.deleteSelection', { count: ids.length }),
            onConfirm: () => remove.mutateAsync({ ids }),
            successTitle: t('subjects.delete.bulkTitle'),
            successDescription: t('subjects.feedback.deleted'),
          })
        }
      />
    </>
  );
}
