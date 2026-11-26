import { useAuditColumns } from '@/shared/components';
import { useTranslation } from 'react-i18next';
import { DataTable, StatusSwitch, useConfirm, type Column } from '@/shared/components';
import { useOnline } from '@/shared/hooks';
import { toast } from 'sonner';
import type { SubjectDto } from '../types';
import { useDeleteSubjects, useToggleSubjectStatus } from '../commands';
import { SubjectRowActions } from './subject-row-actions';
export function SubjectTable({
  rows,
  startIndex,
  onEdit,
  onView,
}: {
  rows: SubjectDto[];
  startIndex?: number;
  onEdit: (row: SubjectDto) => void;
  onView: (row: SubjectDto) => void;
}): JSX.Element {
  const { t, i18n } = useTranslation();
  const lang = i18n.language.startsWith('ar') ? 'ar' : 'en';
  const online = useOnline();
  const { confirm, dialog } = useConfirm();
  const remove = useDeleteSubjects();
  const toggle = useToggleSubjectStatus();
  const auditColumns = useAuditColumns<SubjectDto>();
  const columns: Column<SubjectDto>[] = [
    {
      id: 'index',
      headerClassName: 'w-16',
      header: t('common.index'),
      cell: (_row, index) => <span className="font-medium text-muted">{index + 1}</span>,
    },
    {
      id: 'name',
      headerClassName: 'w-56',
      header: t('subjects.table.name'),
      cell: (row) => (
        <button type="button" className="text-start hover:text-primary" onClick={() => onView(row)}>
          {row.name[lang] || row.name.en || row.name.ar || t('common.noValue')}
        </button>
      ),
    },
    {
      id: 'notes',
      headerClassName: 'min-w-44',
      header: t('subjects.table.note'),
      cell: (row) => (
        <span className="block max-w-56 truncate">
          {row.note[lang] || row.note.en || row.note.ar || t('common.noValue')}
        </span>
      ),
    },
    ...auditColumns,
    {
      id: 'status',
      headerClassName: 'w-36',
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
      headerClassName: 'w-44',
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
        startIndex={startIndex}
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
