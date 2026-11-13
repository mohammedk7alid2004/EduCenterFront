import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, DataTable, ErrorState, Icon, Input, LoadingState } from '@/shared/ui';
import { useDebouncedValue, useUrlState } from '@/shared/lib';
import type { Column } from '@/shared/ui';
import type { TeacherDto } from './teachers.types';
import { useTeachers } from './teachers.queries';
import { TeacherFormModal } from './components/teacher-form-modal';
import { TeacherRowActions } from './components/teacher-row-actions';

const PAGE_SIZE = 10;

export function TeachersPage(): JSX.Element {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as 'ar' | 'en';

  const [search, setSearch] = useUrlState('q', '');
  const [pageStr, setPage] = useUrlState('page', '1');
  const page = Number(pageStr) || 1;
  const debouncedSearch = useDebouncedValue(search, 400);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<TeacherDto | null>(null);

  const { data, isLoading, isError, refetch } = useTeachers({
    name: debouncedSearch || undefined,
    pageNumber: page,
    pageSize: PAGE_SIZE,
  });

  const columns: readonly Column<TeacherDto>[] = [
    {
      id: 'name',
      header: t('teachers.table.name'),
      cell: (row) => <span className="font-medium">{row.name}</span>,
    },
    {
      id: 'email',
      header: t('teachers.table.email'),
      cell: (row) => (
        <span className="flex items-center gap-1 text-muted">
          <Icon name="atSign" className="size-3.5 shrink-0" />
          {row.email}
        </span>
      ),
    },
    {
      id: 'phone',
      header: t('teachers.table.phone'),
      cell: (row) =>
        row.phoneNumber ? (
          <span className="flex items-center gap-1 text-muted">
            <Icon name="phone" className="size-3.5 shrink-0" />
            {row.phoneNumber}
          </span>
        ) : (
          <span className="text-muted">—</span>
        ),
    },
    {
      id: 'subjects',
      header: t('teachers.table.subjects'),
      cell: (row) =>
        row.subjects.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {row.subjects.map((s) => (
              <span
                key={s.id}
                className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-foreground"
              >
                {s.name[lang] ?? s.name.en ?? s.name.ar}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-muted">—</span>
        ),
    },
    {
      id: 'status',
      header: t('teachers.table.status'),
      cell: (row) => (
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
            row.isActive ? 'bg-success/10 text-success' : 'bg-muted/10 text-muted'
          }`}
        >
          {row.isActive ? t('common.active') : t('common.inactive')}
        </span>
      ),
    },
    {
      id: 'actions',
      header: t('teachers.table.actions'),
      cell: (row) => (
        <TeacherRowActions
          teacher={row}
          onEdit={(tc) => {
            setEditingTeacher(tc);
            setModalOpen(true);
          }}
        />
      ),
    },
  ];

  function openCreate() {
    setEditingTeacher(null);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingTeacher(null);
  }

  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Icon name="graduationCap" className="size-6 text-primary" />
          <h1 className="text-xl font-bold text-foreground">{t('teachers.title')}</h1>
          {data && (
            <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-muted">
              {data.totalCount}
            </span>
          )}
        </div>
        <Button onClick={openCreate}>
          <Icon name="plus" className="size-4" />
          {t('teachers.create')}
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
          placeholder={t('teachers.search')}
          startIcon="search"
        />
      </div>

      {/* Table */}
      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState onRetry={() => void refetch()} />
      ) : (
        <DataTable<TeacherDto> columns={columns} rows={data?.items ?? []} />
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
      {modalOpen && <TeacherFormModal teacher={editingTeacher} onClose={closeModal} />}
    </div>
  );
}
