import { API_ENDPOINTS } from '@/config';
import {
  apiClient,
  assertApiSuccess,
  normalizeApiError,
  type ApiResult,
  type PaginatedResult,
  type ListFilters,
} from '@/infrastructure/api';
import type {
  RoleDto,
  RoleDetail,
  PermissionDto,
  RoleValues,
  CreateRoleResult,
} from './roles.types';
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
export async function createRole(
  values: RoleValues,
  signal?: AbortSignal,
): Promise<CreateRoleResult> {
  try {
    const { data } = await apiClient.post<ApiResult<CreateRoleResult>>(
      API_ENDPOINTS.roles.create,
      values,
      { signal },
    );
    assertApiSuccess(data);
    return data.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}
export async function updateRole(
  id: string,
  values: RoleValues,
  signal?: AbortSignal,
): Promise<void> {
  try {
    const { data } = await apiClient.put<ApiResult<boolean>>(
      API_ENDPOINTS.roles.update(id),
      { roleName: values.name, permissionIds: values.permissionIds },
      { signal },
    );
    assertApiSuccess(data);
  } catch (error) {
    throw normalizeApiError(error);
  }
}
export async function deleteRoles(ids: string[], signal?: AbortSignal): Promise<void> {
  try {
    const { data } = await apiClient.delete<ApiResult<boolean>>(API_ENDPOINTS.roles.delete, {
      data: { ids },
      signal,
    });
    assertApiSuccess(data);
  } catch (error) {
    throw normalizeApiError(error);
  }
}
