import { useSearchParams } from 'react-router-dom';
import { LIST_PARAMS, PAGE_SIZES, STATUS_FILTER } from '@/config';
import { useDebouncedValue } from './use-debounced-value';

export function useListControls() {
  const [params, setParams] = useSearchParams();
  const search = params.get(LIST_PARAMS.search) ?? '';
  const requestedPage = Number(params.get(LIST_PARAMS.page));
  const page = Number.isSafeInteger(requestedPage) ? Math.max(1, requestedPage) : 1;
  const requestedSize = Number(params.get(LIST_PARAMS.pageSize));
  const pageSize = PAGE_SIZES.find((size) => size === requestedSize) ?? PAGE_SIZES[0];
  const requestedStatus = params.get(LIST_PARAMS.status);
  const status =
    Object.values(STATUS_FILTER).find((value) => value === requestedStatus) ?? STATUS_FILTER.all;
  const name = useDebouncedValue(search, 400);
  function update(key: string, value: string) {
    setParams((current) => {
      const next = new URLSearchParams(current);
      if (value) next.set(key, value);
      else next.delete(key);
      if (key !== LIST_PARAMS.page) next.delete(LIST_PARAMS.page);
      return next;
    });
  }
  return {
    search,
    page,
    pageSize,
    status,
    filters: {
      name: name || undefined,
      pageNumber: page,
      pageSize,
      isActive: status === STATUS_FILTER.all ? undefined : status === STATUS_FILTER.active,
    },
    setSearch: (value: string) => update(LIST_PARAMS.search, value),
    setPage: (value: number) => update(LIST_PARAMS.page, String(value)),
    setPageSize: (value: number) => update(LIST_PARAMS.pageSize, String(value)),
    setStatus: (value: string) => update(LIST_PARAMS.status, value),
  };
}
