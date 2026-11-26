import { API_ENDPOINTS } from '@/shared/constants';
import { apiClient, assertApiSuccess, normalizeApiError } from '@/shared/api';
import type { ApiResult, PaginatedList, SubjectDetail, SubjectDto, SubjectFilters } from '../types';

export async function fetchSubjects(
  filters: SubjectFilters = {},
  signal?: AbortSignal,
): Promise<PaginatedList<SubjectDto>> {
  try {
    const params: Record<string, string | number | boolean> = {};
    if (filters.name) params['Name'] = filters.name;
    if (filters.pageNumber !== undefined) params['PageNumber'] = filters.pageNumber;
    if (filters.pageSize !== undefined) params['PageSize'] = filters.pageSize;
    if (filters.isActive !== undefined) params['IsActive'] = filters.isActive;

    const { data } = await apiClient.get<ApiResult<PaginatedList<SubjectDto>>>(
      API_ENDPOINTS.subjects.getAll,
      { params, signal },
    );
    assertApiSuccess(data);
    return data.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function fetchSubject(id: string, signal?: AbortSignal): Promise<SubjectDetail> {
  try {
    const { data } = await apiClient.get<ApiResult<SubjectDetail>>(
      API_ENDPOINTS.subjects.getById(id),
      { signal },
    );
    assertApiSuccess(data);
    return data.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}
