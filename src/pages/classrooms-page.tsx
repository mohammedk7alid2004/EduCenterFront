import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PERMISSIONS } from '@/app/config';
import { useListControls, usePermission } from '@/shared/hooks';
import { ManagementList } from '@/shared/components';
import {
  useClassrooms,
  ClassroomsTable,
  ClassroomExcelMenu,
  ClassroomFormModal,
  ImportClassroomsModal,
  ViewClassroomModal,
} from '@/features/classrooms';
import type { ClassroomDto } from '@/features/classrooms';

export function ClassroomsPage(): JSX.Element {
  const { t } = useTranslation();
  const controls = useListControls();
  const query = useClassrooms(controls.filters);
  const can = usePermission();
  const [editing, setEditing] = useState<ClassroomDto | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
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
        searchActions={
          <ClassroomExcelMenu filters={controls.filters} onImport={() => setImportOpen(true)} />
        }
      >
        <ClassroomsTable
          rows={query.data?.items ?? []}
          startIndex={(controls.page - 1) * controls.pageSize}
          onView={setViewing}
          onEdit={(classroom) => {
            setEditing(classroom);
            setFormOpen(true);
          }}
        />
      </ManagementList>
      {formOpen && <ClassroomFormModal classroom={editing} onClose={() => setFormOpen(false)} />}
      {importOpen && <ImportClassroomsModal onClose={() => setImportOpen(false)} />}
      {viewing && <ViewClassroomModal id={viewing.id} onClose={() => setViewing(null)} />}
    </>
  );
}
