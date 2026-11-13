import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ManagementList } from '@/shared/ui';
import { useListControls } from '@/shared/lib';
import type { TeacherDto } from './teachers.types';
import { useTeachers } from './teachers.queries';
import { TeacherTable } from './components/teacher-table';
import { TeacherFormModal } from './components/teacher-form-modal';
import { ViewTeacherModal } from './components/view-teacher-modal';

export function TeachersPage(): JSX.Element {
  const { t } = useTranslation();
  const controls = useListControls();
  const query = useTeachers(controls.filters);
  const [formOpen, setFormOpen] = useState(false);
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
      >
        <TeacherTable
          rows={query.data?.items ?? []}
          onView={setViewing}
          onEdit={(row) => {
            setEditing(row);
            setFormOpen(true);
          }}
        />
      </ManagementList>
      {formOpen && <TeacherFormModal teacher={editing} onClose={() => setFormOpen(false)} />}
      {viewing && <ViewTeacherModal teacher={viewing} onClose={() => setViewing(null)} />}
    </>
  );
}
