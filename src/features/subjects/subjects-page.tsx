import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, DataTable, ErrorState, Icon, Input, LoadingState } from '@/shared/ui';
import { useDebouncedValue, useUrlState } from '@/shared/lib';
import type { Column } from '@/shared/ui';
import type { SubjectDto } from './subjects.types';
import { useSubjects } from './subjects.queries';
import { SubjectFormModal } from './components/subject-form-modal';
import { SubjectRowActions } from './components/subject-row-actions';

const PAGE_SIZE = 10;

export function SubjectsPage(): JSX.Element {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as 'ar' | 'en';

  const [search, setSearch] = useUrlState('q', '');
  const [pageStr, setPage] = useUrlState('page', '1');
  const page = Number(pageStr) || 1;
  const debouncedSearch = useDebouncedValue(search, 400);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<SubjectDto | null>(null);

  const { data, isLoading, isError, refetch } = useSubjects({
    name: debouncedSearch || undefined,
    pageNumber: page,
    pageSize: PAGE_SIZE,
  });

  const columns: readonly Column<SubjectDto>[] = [
    {
      id: 'name',
      header: t('subjects.table.name'),
      cell: (row) => (
        <span className="font-medium">{row.name[lang] ?? row.name.en ?? row.name.ar}</span>
      ),
    },
    {
      id: 'note',
      header: t('subjects.table.note'),
      cell: (row) => (
        <span className="text-muted">{row.note[lang] ?? row.note.en ?? row.note.ar ?? '—'}</span>
      ),
    },
    {
      id: 'status',
      header: t('subjects.table.status'),
      cell: (row) => (
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
            row.isActive ? 'bg-success/10 text-success' : 'bg-muted/10 text-muted'
          }`}
        >
          {row.isActive ? t('common.active') : t('common.inactive')}
        </span>
      ),
    },
    {
      id: 'actions',
      header: t('subjects.table.actions'),
      cell: (row) => (
        <SubjectRowActions
          subject={row}
          onEdit={(s) => {
            setEditingSubject(s);
            setModalOpen(true);
          }}
        />
      ),
    },
  ];

  function openCreate() {
    setEditingSubject(null);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingSubject(null);
  }

  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Icon name="bookOpen" className="size-6 text-primary" />
          <h1 className="text-xl font-bold text-foreground">{t('subjects.title')}</h1>
          {data && (
            <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-muted">
              {data.totalCount}
            </span>
          )}
        </div>
        <Button onClick={openCreate}>
          <Icon name="plus" className="size-4" />
          {t('subjects.create')}
        </Button>
      </div>

      {/* Search */}
      <div className="max-w-sm">
        <Input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage('1');
          }}
          placeholder={t('subjects.search')}
          startIcon="search"
        />
      </div>

      {/* Table */}
      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState onRetry={() => void refetch()} />
      ) : (
        <DataTable<SubjectDto> columns={columns} rows={data?.items ?? []} />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="ghost"
            className="size-9 p-0"
            disabled={page <= 1}
            onClick={() => setPage(String(page - 1))}
          >
            <Icon name="chevronLeft" className="size-4" />
          </Button>
          <span className="text-sm text-muted">
            {t('common.pagination', { page, total: totalPages })}
          </span>
          <Button
            variant="ghost"
            className="size-9 p-0"
            disabled={page >= totalPages}
            onClick={() => setPage(String(page + 1))}
          >
            <Icon name="chevronRight" className="size-4" />
          </Button>
        </div>
      )}

      {/* Modal */}
      {modalOpen && <SubjectFormModal subject={editingSubject} onClose={closeModal} />}
    </div>
  );
}
