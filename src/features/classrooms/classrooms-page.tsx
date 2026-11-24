import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { PERMISSIONS } from '@/config';
import { usePermission } from '@/infrastructure/auth';
import { useListControls, useOnline } from '@/shared/hooks';
import { Button, Icon, ManagementList } from '@/shared/components';
import { downloadBlob } from '@/shared/utils';
import { useClassrooms, useClassroomsExport } from './classrooms.queries';
import type { ClassroomDto } from './classrooms.types';
import { ClassroomsTable } from './components/classrooms-table';
import { ClassroomFormModal } from './components/classroom-form-modal';
import { ViewClassroomModal } from './components/view-classroom-modal';
export function ClassroomsPage(): JSX.Element {
  const { t } = useTranslation();
  const controls = useListControls();
  const online = useOnline();
  const query = useClassrooms(controls.filters);
  const can = usePermission();
  const exporter = useClassroomsExport();
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
        searchActions={
          can(PERMISSIONS.classrooms.export) ? (
            <Button
              type="button"
              variant="ghost"
              className="h-[43px] rounded-xl border border-primary/20 bg-card text-primary"
              disabled={!online || exporter.isPending}
              loading={exporter.isPending}
              onClick={() =>
                exporter.mutate(controls.filters, {
                  onSuccess: (file) => downloadBlob(file, 'Classrooms.xlsx'),
                  onError: (error) =>
                    toast.error(t(error.message, { defaultValue: error.message })),
                })
              }
            >
              <Icon name="download" className="size-4" />
              {t('classrooms.export')}
            </Button>
          ) : undefined
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
      {viewing && <ViewClassroomModal id={viewing.id} onClose={() => setViewing(null)} />}
    </>
  );
}
