import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ManagementList } from '@/shared/components';
import { useListControls } from '@/shared/hooks';
import {
  useTeachers,
  TeacherTable,
  TeacherExcelMenu,
  TeacherFormModal,
  ImportTeachersModal,
  ViewTeacherModal,
} from '@/features/teachers';
import type { TeacherDto } from '@/features/teachers';

export function TeachersPage(): JSX.Element {
  const { t } = useTranslation();
  const controls = useListControls();
  const query = useTeachers(controls.filters);
  const [formOpen, setFormOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [editing, setEditing] = useState<TeacherDto | null>(null);
  const [viewing, setViewing] = useState<TeacherDto | null>(null);

  return (
    <>
      <ManagementList
        title={t('teachers.title')}
        description={t('teachers.description')}
        createLabel={t('teachers.create')}
        controls={controls}
        totalCount={query.data?.totalCount ?? 0}
        totalPages={Math.max(1, query.data?.totalPages ?? 1)}
        loading={query.isLoading}
        fetching={query.isFetching}
        error={query.error}
        onRetry={() => void query.refetch()}
        onCreate={() => {
          setEditing(null);
          setFormOpen(true);
        }}
        searchActions={
          <TeacherExcelMenu filters={controls.filters} onImport={() => setImportOpen(true)} />
        }
      >
        <TeacherTable
          rows={query.data?.items ?? []}
          startIndex={(controls.page - 1) * controls.pageSize}
          onView={setViewing}
          onEdit={(row) => {
            setEditing(row);
            setFormOpen(true);
          }}
        />
      </ManagementList>
      {formOpen && <TeacherFormModal teacher={editing} onClose={() => setFormOpen(false)} />}
      {importOpen && <ImportTeachersModal onClose={() => setImportOpen(false)} />}
      {viewing && <ViewTeacherModal teacher={viewing} onClose={() => setViewing(null)} />}
    </>
  );
}
