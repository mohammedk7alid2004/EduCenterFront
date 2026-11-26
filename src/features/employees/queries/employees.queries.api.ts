import { API_ENDPOINTS } from '@/shared/constants';
import { apiClient, assertApiSuccess, normalizeApiError } from '@/shared/api';
import type { ApiResult, PaginatedResult, ListFilters } from '@/shared/types';
import type { EmployeeDto } from '../types';

export async function fetchEmployees(
  filters: ListFilters = {},
  signal?: AbortSignal,
): Promise<PaginatedResult<EmployeeDto>> {
  try {
    const { data } = await apiClient.get<ApiResult<PaginatedResult<EmployeeDto>>>(
      API_ENDPOINTS.employees.getAll,
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

export async function fetchEmployee(id: string, signal?: AbortSignal): Promise<EmployeeDto> {
  try {
    const { data } = await apiClient.get<ApiResult<EmployeeDto>>(
      API_ENDPOINTS.employees.detail(id),
      { signal },
    );
    assertApiSuccess(data);
    return data.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}
