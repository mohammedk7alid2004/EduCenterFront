import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Button, Icon, ManagementList } from '@/shared/components';
import { useListControls, useOnline } from '@/shared/hooks';
import { downloadBlob } from '@/shared/utils';
import { PERMISSIONS } from '@/config';
import { usePermission } from '@/infrastructure/auth';
import type { TeacherDto } from './teachers.types';
import { useTeachers, useTeachersExport } from './teachers.queries';
import { TeacherTable } from './components/teacher-table';
import { TeacherFormModal } from './components/teacher-form-modal';
import { ViewTeacherModal } from './components/view-teacher-modal';

export function TeachersPage(): JSX.Element {
  const { t } = useTranslation();
  const controls = useListControls();
  const online = useOnline();
  const can = usePermission();
  const query = useTeachers(controls.filters);
  const exporter = useTeachersExport();
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
        searchActions={
          can(PERMISSIONS.teachers.read) ? (
            <Button
              type="button"
              variant="ghost"
              className="h-[43px] rounded-xl border border-primary/20 bg-card text-primary"
              disabled={!online || exporter.isPending}
              loading={exporter.isPending}
              onClick={() =>
                exporter.mutate(controls.filters, {
                  onSuccess: (file) => downloadBlob(file, 'Teachers.xlsx'),
                  onError: (error) =>
                    toast.error(t(error.message, { defaultValue: error.message })),
                })
              }
            >
              <Icon name="download" className="size-4" />
              {t('teachers.export')}
            </Button>
          ) : undefined
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
      {viewing && <ViewTeacherModal teacher={viewing} onClose={() => setViewing(null)} />}
    </>
  );
}
