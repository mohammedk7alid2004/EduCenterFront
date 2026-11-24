import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Button, Icon, ManagementList } from '@/shared/components';
import { useListControls, useOnline } from '@/shared/hooks';
import { downloadBlob } from '@/shared/utils';
import { PERMISSIONS } from '@/config';
import { usePermission } from '@/infrastructure/auth';
import type { SubjectDto } from './subjects.types';
import { useSubjects, useSubjectsExport } from './subjects.queries';
import { SubjectTable } from './components/subject-table';
import { SubjectFormModal } from './components/subject-form-modal';
import { ViewSubjectModal } from './components/view-subject-modal';

export function SubjectsPage(): JSX.Element {
  const { t } = useTranslation();
  const controls = useListControls();
  const online = useOnline();
  const can = usePermission();
  const query = useSubjects(controls.filters);
  const exporter = useSubjectsExport();
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
        searchActions={
          can(PERMISSIONS.subjects.export) ? (
            <Button
              type="button"
              variant="ghost"
              className="h-[43px] rounded-xl border border-primary/20 bg-card text-primary"
              disabled={!online || exporter.isPending}
              loading={exporter.isPending}
              onClick={() =>
                exporter.mutate(controls.filters, {
                  onSuccess: (file) => downloadBlob(file, 'Subjects.xlsx'),
                  onError: (error) =>
                    toast.error(t(error.message, { defaultValue: error.message })),
                })
              }
            >
              <Icon name="download" className="size-4" />
              {t('subjects.export')}
            </Button>
          ) : undefined
        }
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
