import { API_ENDPOINTS } from '@/shared/constants';
import { apiClient, assertApiSuccess, normalizeApiError } from '@/shared/api';
import type { ApiResult, ListFilters, PaginatedResult } from '@/shared/types';
import type { ClassroomDto } from '../types';

export async function fetchClassrooms(
  filters: ListFilters = {},
  signal?: AbortSignal,
): Promise<PaginatedResult<ClassroomDto>> {
  try {
    const { data } = await apiClient.get<ApiResult<PaginatedResult<ClassroomDto>>>(
      API_ENDPOINTS.classrooms.getAll,
      {
        params: {
          Name: filters.name,
          PageNumber: filters.pageNumber,
          PageSize: filters.pageSize,
          IsActive: filters.isActive,
        },
        signal,
      },
    );
    assertApiSuccess(data);
    return data.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function fetchClassroom(id: string, signal?: AbortSignal): Promise<ClassroomDto> {
  try {
    const { data } = await apiClient.get<ApiResult<ClassroomDto>>(
      API_ENDPOINTS.classrooms.getById(id),
      { signal },
    );
    assertApiSuccess(data);
    return data.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}
