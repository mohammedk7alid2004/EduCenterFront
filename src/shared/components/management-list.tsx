import { useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PAGE_SIZES, ROUTES, STATUS_FILTER } from '@/shared/constants';
import type { ApiError } from '@/shared/api';
import { useOnline } from '@/shared/hooks';
import { type useListControls } from '@/shared/hooks';
import { Button } from './button';
import { Icon } from './icon';
import { ErrorState, LoadingState } from './states';

interface ManagementListProps {
  title: string;
  description: string;
  createLabel: string;
  totalCount: number;
  totalPages: number;
  controls: ReturnType<typeof useListControls>;
  loading: boolean;
  fetching: boolean;
  error: ApiError | null;
  onRetry: () => void;
  onCreate: () => void;
  canCreate?: boolean;
  statusFilter?: boolean;
  children: ReactNode;
  beforeSearch?: ReactNode;
  searchActions?: ReactNode;
  filterContent?: ReactNode;
  pagination?: boolean;
}

export function ManagementList(props: ManagementListProps): JSX.Element {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const online = useOnline();
  const [filterOpen, setFilterOpen] = useState(false);
  const { controls, totalPages } = props;
  const hasFilters = props.statusFilter !== false || Boolean(props.filterContent);
  const firstPage = Math.max(1, Math.min(controls.page - 2, totalPages - 4));
  useEffect(() => {
    if (!props.loading && !props.fetching && !props.error && controls.page > totalPages)
      controls.setPage(totalPages);
  }, [props.loading, props.fetching, props.error, controls, totalPages]);
  const pages = Array.from({ length: Math.min(5, totalPages) }, (_, index) => firstPage + index);
  return (
    <section className="flex flex-1 flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate(ROUTES.dashboard)}
            aria-label={t('common.back')}
            className="grid size-11 shrink-0 place-items-center rounded-full bg-iconSurface text-primary transition hover:bg-primary/15"
          >
            <Icon name="arrowLeft" className="size-6 rtl:rotate-180" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold leading-9">{props.title}</h1>
              <span className="rounded-md bg-primary px-1.5 py-1 text-sm text-card">
                {props.totalCount}
              </span>
            </div>
            <p className="mt-0.5 text-xs leading-[18px] text-muted">{props.description}</p>
          </div>
        </div>
        {props.canCreate !== false && (
          <Button
            onClick={props.onCreate}
            disabled={!online}
            className="h-[43px] rounded-[10px] font-normal"
          >
            <Icon name="addSquare" className="size-5" />
            {props.createLabel}
          </Button>
        )}
      </div>
      {props.beforeSearch}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative min-w-40 flex-1">
          <Icon
            name="search"
            className="pointer-events-none absolute start-4 top-1/2 size-4 -translate-y-1/2 text-muted"
          />
          <input
            type="search"
            value={controls.search}
            aria-label={t('common.search')}
            placeholder={t('common.searchPlaceholder')}
            onChange={(event) => controls.setSearch(event.target.value)}
            className="h-[43px] w-full rounded-[10px] border border-muted bg-card pe-4 ps-10 text-xs shadow-sm outline-none transition placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/10"
          />
        </div>
        {hasFilters && (
          <Button
            variant="ghost"
            aria-expanded={filterOpen}
            onClick={() => setFilterOpen(!filterOpen)}
            className={`h-[43px] rounded-xl border ${controls.status ? 'border-primary text-primary' : 'border-muted text-muted'}`}
          >
            <Icon name="filter" className="size-5" />
            {t('common.filter')}
          </Button>
        )}
        {props.searchActions}
      </div>
      {filterOpen && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-subtle p-4">
          {props.filterContent && <div className="w-full">{props.filterContent}</div>}
          {props.statusFilter !== false && (
            <>
              <label htmlFor="status-filter" className="text-sm">
                {t('common.status')}
              </label>
              <select
                id="status-filter"
                value={controls.status}
                onChange={(event) => controls.setStatus(event.target.value)}
                className="rounded-lg border border-border bg-card px-3 py-2 text-sm"
              >
                <option value={STATUS_FILTER.all}>{t('common.all')}</option>
                <option value={STATUS_FILTER.active}>{t('common.active')}</option>
                <option value={STATUS_FILTER.inactive}>{t('common.inactive')}</option>
              </select>
              <Button variant="ghost" onClick={() => controls.setStatus(STATUS_FILTER.all)}>
                {t('common.clearFilters')}
              </Button>
            </>
          )}
        </div>
      )}
      {!online && (
        <p role="status" className="rounded-xl border border-warning/30 bg-warning/10 p-3 text-sm">
          {t('errors.network')}
        </p>
      )}
      <div className="min-w-0 flex-1" aria-busy={props.loading || props.fetching}>
        {props.loading ? (
          <LoadingState />
        ) : props.error ? (
          <ErrorState error={props.error} onRetry={props.onRetry} />
        ) : (
          props.children
        )}
      </div>
      {props.pagination !== false && (
        <div className="mt-1 flex flex-wrap items-center justify-between gap-4 pb-6 text-sm">
          <label className="header-control flex items-center gap-3 rounded-xl bg-card px-4 py-2">
            {t('common.perPage')}
            <select
              value={controls.pageSize}
              onChange={(event) => controls.setPageSize(Number(event.target.value))}
              className="rounded-lg border border-primary/60 bg-iconSurface px-3 py-1 text-primary"
            >
              {PAGE_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
          <nav aria-label={t('common.paginationLabel')} className="flex items-center gap-2">
            <button
              type="button"
              disabled={controls.page <= 1 || props.fetching}
              aria-label={t('common.previousPage')}
              onClick={() => controls.setPage(controls.page - 1)}
              className="grid size-[33px] place-items-center rounded-lg bg-iconSurface text-primary disabled:opacity-40"
            >
              <Icon name="chevronLeft" className="size-4 rtl:rotate-180" />
            </button>
            {pages.map((page) => (
              <button
                type="button"
                key={page}
                aria-current={page === controls.page ? 'page' : undefined}
                onClick={() => controls.setPage(page)}
                className={`grid size-[33px] place-items-center rounded-lg ${page === controls.page ? 'bg-primary text-card' : 'text-muted hover:bg-subtle'}`}
              >
                {String(page).padStart(2, '0')}
              </button>
            ))}
            <button
              type="button"
              disabled={controls.page >= totalPages || props.fetching}
              aria-label={t('common.nextPage')}
              onClick={() => controls.setPage(controls.page + 1)}
              className="grid size-[33px] place-items-center rounded-lg bg-iconSurface text-primary disabled:opacity-40"
            >
              <Icon name="chevronRight" className="size-4 rtl:rotate-180" />
            </button>
          </nav>
        </div>
      )}
    </section>
  );
}
