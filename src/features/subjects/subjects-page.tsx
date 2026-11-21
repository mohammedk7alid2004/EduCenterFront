import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ManagementList } from '@/shared/components';
import { useListControls } from '@/shared/hooks';
import type { SubjectDto } from './subjects.types';
import { useSubjects } from './subjects.queries';
import { SubjectTable } from './components/subject-table';
import { SubjectFormModal } from './components/subject-form-modal';
import { ViewSubjectModal } from './components/view-subject-modal';

export function SubjectsPage(): JSX.Element {
  const { t } = useTranslation();
  const controls = useListControls();
  const query = useSubjects(controls.filters);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<SubjectDto | null>(null);
  const [viewing, setViewing] = useState<SubjectDto | null>(null);
  return (
    <>
      <ManagementList
        title={t('subjects.title')}
        description={t('subjects.description')}
        createLabel={t('subjects.create')}
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
        <SubjectTable
          rows={query.data?.items ?? []}
          startIndex={(controls.page - 1) * controls.pageSize}
          onView={setViewing}
          onEdit={(row) => {
            setEditing(row);
            setFormOpen(true);
          }}
        />
      </ManagementList>
      {formOpen && <SubjectFormModal subject={editing} onClose={() => setFormOpen(false)} />}
      {viewing && <ViewSubjectModal subject={viewing} onClose={() => setViewing(null)} />}
    </>
  );
}
