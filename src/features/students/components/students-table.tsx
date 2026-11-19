import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { PERMISSIONS } from '@/config';
import { usePermission } from '@/infrastructure/auth';
import { useOnline } from '@/shared/hooks';
import {
  DataTable,
  FeedbackDialog,
  RowActions,
  StatusSwitch,
  useConfirm,
  useAuditColumns,
  type Column,
} from '@/shared/components';
import { studentLocalizedName } from '../students.lib';
import { useDeleteStudents, useToggleStudentStatus } from '../students.queries';
import type { StudentDto } from '../students.types';
import { StudentRelatedSummary } from './student-related-summary';
export function StudentsTable({
  rows,
  onView,
  onEdit,
}: {
  rows: StudentDto[];
  onView: (row: StudentDto) => void;
  onEdit: (row: StudentDto) => void;
}): JSX.Element {
  const { t, i18n } = useTranslation();
  const can = usePermission();
  const online = useOnline();
  const remove = useDeleteStudents();
  const toggle = useToggleStudentStatus();
  const { confirm, dialog } = useConfirm();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [statusSuccess, setStatusSuccess] = useState(false);
  const pending = !online || remove.isPending || toggle.isPending;
  const audit = useAuditColumns<StudentDto>();
  function deleteSelection(ids: string[]) {
    confirm({
      title: t('students.delete.title'),
      description: t('common.deleteSelection', { count: ids.length }),
      onConfirm: () => remove.mutateAsync(ids),
      successTitle: t('students.delete.title'),
      successDescription: t('students.feedback.deleted'),
    });
  }
  const columns: Column<StudentDto>[] = [
    {
      id: 'id',
      header: t('common.id'),
      cell: (row) => (
        <span className="block max-w-24 truncate" title={row.id}>
          #<bdi>{row.id}</bdi>
        </span>
      ),
    },
    {
      id: 'name',
      header: t('students.studentName'),
      headerClassName: 'min-w-48',
      cell: (row) =>
        can(PERMISSIONS.students.detail) ? (
          <button
            type="button"
            className="text-start hover:text-primary"
            onClick={() => onView(row)}
          >
            {row.name}
          </button>
        ) : (
          row.name
        ),
    },
    { id: 'email', header: t('students.form.email'), cell: (row) => <bdi>{row.email}</bdi> },
    {
      id: 'phoneNumber',
      header: t('students.form.phoneNumber'),
      cell: (row) => <bdi>{row.phoneNumber || t('common.noValue')}</bdi>,
    },
    {
      id: 'level',
      header: t('students.form.level'),
      cell: (row) => studentLocalizedName(row.educationLevel, i18n.language) || t('common.noValue'),
    },
    {
      id: 'grade',
      header: t('students.form.grade'),
      cell: (row) => studentLocalizedName(row.educationGrade, i18n.language) || t('common.noValue'),
    },
    ...audit,
    {
      id: 'status',
      header: t('common.status'),
      cell: (row) => (
        <StatusSwitch
          active={row.isActive}
          disabled={pending}
          readOnly={!can(PERMISSIONS.students.toggleStatus)}
          onChange={() =>
            toggle.mutate(row.id, {
              onSuccess: () => setStatusSuccess(true),
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
        <RowActions
          onView={() => onView(row)}
          onEdit={() => onEdit(row)}
          onDelete={() => deleteSelection([row.id])}
          disabled={pending}
          canView={can(PERMISSIONS.students.detail)}
          canEdit={can(PERMISSIONS.students.update) && can(PERMISSIONS.students.detail)}
          canDelete={can(PERMISSIONS.students.delete)}
        />
      ),
    },
  ];
  return (
    <>
      {dialog}
      {statusSuccess && (
        <FeedbackDialog
          title={t('students.title')}
          description={t('students.feedback.status')}
          onClose={() => setStatusSuccess(false)}
        />
      )}
      <DataTable
        columns={columns}
        rows={rows}
        pending={pending}
        onDeleteSelected={can(PERMISSIONS.students.delete) ? deleteSelection : undefined}
        expandedRowId={expandedId}
        onToggleExpanded={(id) => setExpandedId((current) => (current === id ? null : id))}
        expandLabel={(row) => t('students.expand', { name: row.name })}
        renderExpanded={(row) => <StudentRelatedSummary student={row} />}
      />
    </>
  );
}
