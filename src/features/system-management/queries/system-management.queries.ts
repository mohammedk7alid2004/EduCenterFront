import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { QUERY_KEYS } from '@/shared/constants';
import type { ApiError } from '@/shared/api';
import type { ListFilters, PaginatedResult } from '@/shared/types';
import { fetchFaqs, fetchSettings } from './system-management.queries.api';
import { CENTER_BRAND_ENDPOINT, FAQ_ENDPOINTS } from '../constants';
import type { CenterSettings, FaqDto } from '../types';

export function useCenterBrand() {
  return useQuery<CenterSettings, ApiError>({
    queryKey: [...QUERY_KEYS.systemManagement, CENTER_BRAND_ENDPOINT],
    queryFn: ({ signal }) => fetchSettings<CenterSettings>(CENTER_BRAND_ENDPOINT, signal),
    retry: false,
    staleTime: 300_000,
  });
}

export function useSettings<T>(endpoint: string) {
  const { i18n } = useTranslation();
  return useQuery<T, ApiError>({
    queryKey: [...QUERY_KEYS.systemManagement, endpoint, i18n.language],
    queryFn: ({ signal }) => fetchSettings<T>(endpoint, signal),
  });
}

export function useFaqs(filters: ListFilters) {
  const { i18n } = useTranslation();
  return useQuery<PaginatedResult<FaqDto>, ApiError>({
    queryKey: [...QUERY_KEYS.systemManagement, FAQ_ENDPOINTS.base, i18n.language, filters],
    queryFn: ({ signal }) => fetchFaqs(filters, signal),
  });
}
