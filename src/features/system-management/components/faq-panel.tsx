import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { usePermission } from '@/infrastructure/auth';
import { useListControls } from '@/shared/hooks';
import { ManagementList } from '@/shared/components';
import { FAQ_PERMISSIONS, SETTINGS_DIALOG } from '../system-management.constants';
import { useFaqs } from '../system-management.queries';
import { FaqTable } from './faq-table';
import { FaqModal } from './faq-modal';
export function FaqPanel({ tabs }: { tabs: ReactNode }): JSX.Element {
  const { t } = useTranslation();
  const can = usePermission();
  const controls = useListControls();
  const query = useFaqs(controls.filters);
  const [dialog, setDialog] = useState<{ id?: string; mode: string } | null>(null);
  return (
    <>
      <ManagementList
        title={t('nav.system')}
        description={t('systemManagement.description')}
        createLabel={t('systemManagement.faq.create')}
        canCreate={can(FAQ_PERMISSIONS.create)}
        totalCount={query.data?.totalCount ?? 0}
        totalPages={Math.max(1, query.data?.totalPages ?? 1)}
        controls={controls}
        loading={query.isPending}
        fetching={query.isFetching}
        error={query.error}
        onRetry={() => void query.refetch()}
        onCreate={() => setDialog({ mode: SETTINGS_DIALOG.edit })}
        beforeSearch={tabs}
      >
        <FaqTable
          rows={query.data?.items ?? []}
          onView={(id) => setDialog({ id, mode: SETTINGS_DIALOG.view })}
          onEdit={(id) => setDialog({ id, mode: SETTINGS_DIALOG.edit })}
        />
      </ManagementList>
      {dialog && <FaqModal {...dialog} onClose={() => setDialog(null)} />}
    </>
  );
}
