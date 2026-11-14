import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PERMISSIONS } from '@/config';
import { usePermission } from '@/core/auth';
import { useListControls } from '@/shared/lib';
import { ManagementList } from '@/shared/ui';
import { useClassrooms } from './classrooms.queries';
import type { ClassroomDto } from './classrooms.types';
import { ClassroomsTable } from './components/classrooms-table';
import { ClassroomFormModal } from './components/classroom-form-modal';
import { ViewClassroomModal } from './components/view-classroom-modal';
export function ClassroomsPage(): JSX.Element {
  const { t } = useTranslation();
  const controls = useListControls();
  const query = useClassrooms(controls.filters);
  const can = usePermission();
  const [editing, setEditing] = useState<ClassroomDto | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [viewing, setViewing] = useState<ClassroomDto | null>(null);
  return (
    <>
      <ManagementList
        title={t('classrooms.title')}
        description={t('classrooms.description')}
        createLabel={t('classrooms.create')}
        controls={controls}
        canCreate={can(PERMISSIONS.classrooms.create)}
        totalCount={query.data?.totalCount ?? 0}
        totalPages={Math.max(1, query.data?.totalPages ?? 1)}
        loading={query.isPending}
        fetching={query.isFetching}
        error={query.error}
        onRetry={() => void query.refetch()}
        onCreate={() => {
          setEditing(null);
          setFormOpen(true);
        }}
      >
        <ClassroomsTable
          rows={query.data?.items ?? []}
          onView={setViewing}
          onEdit={(classroom) => {
            setEditing(classroom);
            setFormOpen(true);
          }}
        />
      </ManagementList>
      {formOpen && <ClassroomFormModal classroom={editing} onClose={() => setFormOpen(false)} />}
      {viewing && <ViewClassroomModal id={viewing.id} onClose={() => setViewing(null)} />}
    </>
  );
}
