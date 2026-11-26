import { API_ENDPOINTS } from '@/shared/constants';
import { apiClient, assertApiSuccess, normalizeApiError } from '@/shared/api';
import type { ApiResult } from '@/shared/types';
import type { RoleValues, CreateRoleResult } from '../types';

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
