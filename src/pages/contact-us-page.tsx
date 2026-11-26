import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Icon, ManagementList } from '@/shared/components';
import {
  useContacts,
  useContactControls,
  ContactTable,
  ViewContactModal,
  ContactTools,
  ContactFilters,
  ImportContactModal,
  SendContactEmailModal,
} from '@/features/contact-us';
import type { ContactMessage } from '@/features/contact-us';
export function ContactUsPage(): JSX.Element {
  const { t } = useTranslation();
  const state = useContactControls();
  const query = useContacts(state.filters);
  const [viewing, setViewing] = useState<string | null>(null);
  const [replying, setReplying] = useState<ContactMessage | null>(null);
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
        <ContactTable
          rows={query.data?.items ?? []}
          startIndex={(state.controls.page - 1) * state.controls.pageSize}
          onView={setViewing}
          onReply={setReplying}
        />
      </ManagementList>
      {viewing && <ViewContactModal id={viewing} onClose={() => setViewing(null)} />}
      {replying && <SendContactEmailModal contact={replying} onClose={() => setReplying(null)} />}
      {importOpen && <ImportContactModal onClose={() => setImportOpen(false)} />}
    </>
  );
}
