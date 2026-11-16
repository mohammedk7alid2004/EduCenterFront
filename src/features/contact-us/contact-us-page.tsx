import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Icon, ManagementList } from '@/shared/ui';
import { useContacts } from './contact-us.queries';
import { useContactControls } from './contact-us.controls';
import { ContactTable } from './components/contact-table';
import { ViewContactModal } from './components/view-contact-modal';
import { ContactTools } from './components/contact-tools';
import { ContactFilters } from './components/contact-filters';
import { ImportContactModal } from './components/import-contact-modal';
export function ContactUsPage(): JSX.Element {
  const { t } = useTranslation();
  const state = useContactControls();
  const query = useContacts(state.filters);
  const [viewing, setViewing] = useState<string | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  return (
    <>
      <ManagementList
        title={t('contactUs.title')}
        description={t('contactUs.description')}
        createLabel=""
        canCreate={false}
        onCreate={() => undefined}
        statusFilter={false}
        controls={state.controls}
        totalCount={query.data?.totalCount ?? 0}
        totalPages={Math.max(1, query.data?.totalPages ?? 1)}
        loading={query.isPending}
        fetching={query.isFetching}
        error={query.error}
        onRetry={() => void query.refetch()}
        beforeSearch={<ContactTools filters={state.filters} onImport={() => setImportOpen(true)} />}
        searchActions={
          <Button
            variant="ghost"
            aria-expanded={filterOpen}
            onClick={() => setFilterOpen(!filterOpen)}
            className={`rounded-xl border ${state.email || state.phone || state.subject ? 'border-primary text-primary' : 'border-muted text-muted'}`}
          >
            <Icon name="filter" className="size-5" />
            {t('common.filter')}
          </Button>
        }
      >
        {filterOpen && (
          <div className="mb-6">
            <ContactFilters state={state} />
          </div>
        )}
        <ContactTable rows={query.data?.items ?? []} onView={setViewing} />
      </ManagementList>
      {viewing && <ViewContactModal id={viewing} onClose={() => setViewing(null)} />}
      {importOpen && <ImportContactModal onClose={() => setImportOpen(false)} />}
    </>
  );
}
