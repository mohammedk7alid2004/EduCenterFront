import { API_ENDPOINTS } from '@/shared/constants';
import { apiClient, assertApiSuccess, normalizeApiError } from '@/shared/api';
import type { ApiResult, PaginatedResult, ListFilters } from '@/shared/types';
import type { RoleDto, RoleDetail, PermissionDto } from '../types';

export async function fetchRoles(
  filters: ListFilters = {},
  signal?: AbortSignal,
): Promise<PaginatedResult<RoleDto>> {
  try {
    const { data } = await apiClient.get<ApiResult<PaginatedResult<RoleDto>>>(
      API_ENDPOINTS.roles.getAll,
      {
        params: { Name: filters.name, PageNumber: filters.pageNumber, PageSize: filters.pageSize },
        signal,
      },
    );
    assertApiSuccess(data);
    return data.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function fetchRoleOptions(signal?: AbortSignal): Promise<RoleDto[]> {
  try {
    const { data } = await apiClient.get<ApiResult<RoleDto[]>>(API_ENDPOINTS.roles.options, {
      signal,
    });
    assertApiSuccess(data);
    return data.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function fetchRole(id: string, signal?: AbortSignal): Promise<RoleDetail> {
  try {
    const { data } = await apiClient.get<ApiResult<RoleDetail>>(API_ENDPOINTS.roles.detail(id), {
      signal,
    });
    assertApiSuccess(data);
    return data.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function fetchPermissionCatalog(signal?: AbortSignal): Promise<PermissionDto[]> {
  try {
    const { data } = await apiClient.get<ApiResult<PermissionDto[]>>(
      API_ENDPOINTS.roles.permissions,
      { signal },
    );
    assertApiSuccess(data);
    return data.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}
