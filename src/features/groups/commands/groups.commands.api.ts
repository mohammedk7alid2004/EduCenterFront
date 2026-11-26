import { API_ENDPOINTS } from '@/shared/constants';
import { apiClient, assertApiSuccess, normalizeApiError } from '@/shared/api';
import type { ApiResult } from '@/shared/types';
import type { GroupFilters, ConnectStudentsPayload } from '../types';

const endpoints = API_ENDPOINTS.groups;

export async function deleteGroups(ids: string[], signal?: AbortSignal): Promise<void> {
  try {
    const { data } = await apiClient.delete<ApiResult<boolean>>(endpoints.delete, {
      data: { ids },
      signal,
    });
    assertApiSuccess(data);
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function exportGroups(filters: GroupFilters, signal?: AbortSignal): Promise<Blob> {
  try {
    const { data } = await apiClient.get<Blob>(endpoints.export, {
      responseType: 'blob',
      signal,
      params: {
        Search: filters.name,
        IsActive: filters.isActive,
        SubjectId: filters.subjectId,
      },
    });
    if (data.type.includes('json')) {
      const result: ApiResult<unknown> = JSON.parse(await data.text());
      assertApiSuccess(result);
      throw new Error('errors.unknown');
    }
    return data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function connectStudentsToGroup(
  payload: ConnectStudentsPayload,
  signal?: AbortSignal,
): Promise<void> {
  try {
    const { data } = await apiClient.post<ApiResult<boolean>>(endpoints.connectStudents, payload, {
      signal,
    });
    assertApiSuccess(data);
  } catch (error) {
    throw normalizeApiError(error);
  }
}
