import { API_ENDPOINTS } from '@/shared/constants';
import { apiClient, assertApiSuccess, normalizeApiError } from '@/shared/api';
import type { ApiResult, PaginatedResult } from '@/shared/types';
import type { EmployeeDto, EmployeeFilters } from '../types';

export async function fetchEmployees(
  filters: EmployeeFilters = {},
  signal?: AbortSignal,
): Promise<PaginatedResult<EmployeeDto>> {
  try {
    const { data } = await apiClient.get<ApiResult<PaginatedResult<EmployeeDto>>>(
      API_ENDPOINTS.employees.getAll,
      {
        params: {
          Search: filters.name,
          PageNumber: filters.pageNumber,
          PageSize: filters.pageSize,
          IsActive: filters.isActive,
          RoleId: filters.roleId,
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
