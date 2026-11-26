import { API_ENDPOINTS } from '@/shared/constants';
import { apiClient, assertApiSuccess, normalizeApiError } from '@/shared/api';
import type {
  ApiResult,
  CreateSubjectPayload,
  DeleteSubjectsPayload,
  SubjectFilters,
  UpdateSubjectPayload,
} from '../types';

export async function createSubject(
  payload: CreateSubjectPayload,
  signal?: AbortSignal,
): Promise<string> {
  try {
    const { data } = await apiClient.post<ApiResult<string>>(
      API_ENDPOINTS.subjects.create,
      payload,
      { signal },
    );
    assertApiSuccess(data);
    return data.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function updateSubject(
  payload: UpdateSubjectPayload,
  signal?: AbortSignal,
): Promise<void> {
  try {
    const { data } = await apiClient.put<ApiResult<unknown>>(
      API_ENDPOINTS.subjects.update,
      payload,
      { signal },
    );
    assertApiSuccess(data);
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function deleteSubjects(
  payload: DeleteSubjectsPayload,
  signal?: AbortSignal,
): Promise<void> {
  try {
    const { data } = await apiClient.delete<ApiResult<unknown>>(API_ENDPOINTS.subjects.delete, {
      data: payload,
      signal,
    });
    assertApiSuccess(data);
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function toggleSubjectStatus(id: string, signal?: AbortSignal): Promise<void> {
  try {
    const { data } = await apiClient.patch<ApiResult<unknown>>(
      API_ENDPOINTS.subjects.toggleStatus(id),
      null,
      { signal },
    );
    assertApiSuccess(data);
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function exportSubjects(filters: SubjectFilters, signal?: AbortSignal): Promise<Blob> {
  try {
    const params: Record<string, string | number | boolean> = {};
    if (filters.name) params['Name'] = filters.name;
    if (filters.isActive !== undefined) params['IsActive'] = filters.isActive;
    const { data } = await apiClient.get<Blob>(API_ENDPOINTS.subjects.export, {
      responseType: 'blob',
      params,
      signal,
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
