import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PAGE_SIZES, STATUS_FILTER } from '@/config';
import { usePermission } from '@/infrastructure/auth';
import { useListControls, useOnline } from '@/shared/hooks';
import { Button, ErrorState, Icon, LoadingState } from '@/shared/components';
import { FAQ_PERMISSIONS, SETTINGS_DIALOG } from '../system-management.constants';
import { useFaqs } from '../system-management.queries';
import { FaqTable } from './faq-table';
import { FaqModal } from './faq-modal';

export function FaqPanel(): JSX.Element {
  const { t } = useTranslation();
  const can = usePermission();
  const online = useOnline();
  const controls = useListControls();
  const query = useFaqs(controls.filters);
  const [filterOpen, setFilterOpen] = useState(false);
  const [dialog, setDialog] = useState<{ id?: string; mode: string } | null>(null);

  const totalPages = Math.max(1, query.data?.totalPages ?? 1);
  const firstPage = Math.max(1, Math.min(controls.page - 2, totalPages - 4));
  const pages = Array.from({ length: Math.min(5, totalPages) }, (_, index) => firstPage + index);

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-xs">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 bg-subtle/50 p-5 sm:p-6">
          <div className="flex items-center gap-3.5">
            <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
              <Icon name="help" className="size-6" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-foreground">
                  {t('systemManagement.tabs.faq')}
                </h2>
                <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                  {query.data?.totalCount ?? 0}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-muted">
                {t('systemManagement.subtitles.faq', {
                  defaultValue: t('systemManagement.description'),
                })}
              </p>
            </div>
          </div>

          {can(FAQ_PERMISSIONS.create) && (
            <Button
              disabled={!online}
              onClick={() => setDialog({ mode: SETTINGS_DIALOG.edit })}
              className="h-9 rounded-xl px-4 text-xs font-medium"
            >
              <Icon name="addSquare" className="size-4" />
              {t('systemManagement.faq.create')}
            </Button>
          )}
        </div>

        {/* Search & Filter Bar */}
        <div className="border-b border-border/60 p-5">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-40 flex-1">
              <Icon
                name="search"
                className="pointer-events-none absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-muted"
              />
              <input
                type="search"
                value={controls.search}
                aria-label={t('common.search')}
                placeholder={t('common.searchPlaceholder')}
                onChange={(event) => controls.setSearch(event.target.value)}
                className="h-10 w-full rounded-xl border border-border bg-subtle/30 pe-4 ps-10 text-xs shadow-2xs outline-none transition placeholder:text-muted focus:border-primary focus:bg-card focus:ring-2 focus:ring-primary/10"
              />
            </div>

            <Button
              variant="ghost"
              aria-expanded={filterOpen}
              onClick={() => setFilterOpen(!filterOpen)}
              className={`h-10 rounded-xl border text-xs ${
                controls.status ? 'border-primary text-primary' : 'border-border text-muted'
              }`}
            >
              <Icon name="filter" className="size-4" />
              {t('common.filter')}
            </Button>
          </div>

          {filterOpen && (
            <div className="mt-3 flex flex-wrap items-center gap-3 rounded-xl border border-border bg-subtle p-3 text-xs">
              <label htmlFor="faq-status-filter" className="font-medium text-foreground">
                {t('common.status')}
              </label>
              <select
                id="faq-status-filter"
                value={controls.status}
                onChange={(event) => controls.setStatus(event.target.value)}
                className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs"
              >
                <option value={STATUS_FILTER.all}>{t('common.all')}</option>
                <option value={STATUS_FILTER.active}>{t('common.active')}</option>
                <option value={STATUS_FILTER.inactive}>{t('common.inactive')}</option>
              </select>
              <Button
                variant="ghost"
                onClick={() => controls.setStatus(STATUS_FILTER.all)}
                className="h-7 text-xs"
              >
                {t('common.clearFilters')}
              </Button>
            </div>
          )}
        </div>

        {/* Content Table */}
        <div className="p-5" aria-busy={query.isPending || query.isFetching}>
          {query.isPending ? (
            <LoadingState />
          ) : query.error ? (
            <ErrorState error={query.error} onRetry={() => void query.refetch()} />
          ) : (
            <FaqTable
              rows={query.data?.items ?? []}
              onView={(id) => setDialog({ id, mode: SETTINGS_DIALOG.view })}
              onEdit={(id) => setDialog({ id, mode: SETTINGS_DIALOG.edit })}
            />
          )}
        </div>

        {/* Pagination Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border/60 bg-subtle/20 px-5 py-3.5 text-xs text-muted">
          <label className="flex items-center gap-2">
            {t('common.perPage')}
            <select
              value={controls.pageSize}
              onChange={(event) => controls.setPageSize(Number(event.target.value))}
              className="rounded-lg border border-border bg-card px-2.5 py-1 text-xs text-foreground"
            >
              {PAGE_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>

          <nav aria-label={t('common.paginationLabel')} className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={controls.page <= 1 || query.isFetching}
              aria-label={t('common.previousPage')}
              onClick={() => controls.setPage(controls.page - 1)}
              className="grid size-8 place-items-center rounded-lg border border-border bg-card text-foreground transition hover:border-primary/50 disabled:opacity-40"
            >
              <Icon name="chevronLeft" className="size-3.5 rtl:rotate-180" />
            </button>
            {pages.map((page) => (
              <button
                type="button"
                key={page}
                aria-current={page === controls.page ? 'page' : undefined}
                onClick={() => controls.setPage(page)}
                className={`grid size-8 place-items-center rounded-lg text-xs font-medium transition ${
                  page === controls.page
                    ? 'bg-primary text-card shadow-xs'
                    : 'border border-transparent text-muted hover:border-border hover:bg-card'
                }`}
              >
                {String(page).padStart(2, '0')}
              </button>
            ))}
            <button
              type="button"
              disabled={controls.page >= totalPages || query.isFetching}
              aria-label={t('common.nextPage')}
              onClick={() => controls.setPage(controls.page + 1)}
              className="grid size-8 place-items-center rounded-lg border border-border bg-card text-foreground transition hover:border-primary/50 disabled:opacity-40"
            >
              <Icon name="chevronRight" className="size-3.5 rtl:rotate-180" />
            </button>
          </nav>
        </div>
      </div>

      {dialog && <FaqModal {...dialog} onClose={() => setDialog(null)} />}
    </>
  );
}
