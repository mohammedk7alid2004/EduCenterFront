import { apiClient, assertApiSuccess, normalizeApiError } from '@/shared/api';
import type { ApiResult, ListFilters, PaginatedResult } from '@/shared/types';
import { FAQ_ENDPOINTS } from '../constants';
import type { FaqDto } from '../types';

export async function fetchSettings<T>(endpoint: string, signal?: AbortSignal): Promise<T> {
  try {
    const { data } = await apiClient.get<ApiResult<T>>(endpoint, { signal });
    assertApiSuccess(data);
    return data.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function fetchFaqs(
  filters: ListFilters,
  signal?: AbortSignal,
): Promise<PaginatedResult<FaqDto>> {
  try {
    const { data } = await apiClient.get<ApiResult<PaginatedResult<FaqDto>>>(FAQ_ENDPOINTS.base, {
      params: {
        Name: filters.name,
        PageNumber: filters.pageNumber,
        PageSize: filters.pageSize,
        IsActive: filters.isActive,
      },
      signal,
    });
    assertApiSuccess(data);
    return data.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}
