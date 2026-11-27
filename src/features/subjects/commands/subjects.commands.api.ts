import { API_ENDPOINTS } from '@/shared/constants';
import { apiClient, assertApiSuccess, normalizeApiError, unwrapExcelBlob } from '@/shared/api';
import type {
  ApiResult,
  CreateSubjectPayload,
  DeleteSubjectsPayload,
  SubjectFilters,
  UpdateSubjectPayload,
} from '../types';
import type { ExcelImportResult } from '@/shared/types';

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
    return await unwrapExcelBlob(data);
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function fetchSubjectTemplate(signal?: AbortSignal): Promise<Blob> {
  try {
    const { data } = await apiClient.get<Blob>(API_ENDPOINTS.subjects.template, {
      responseType: 'blob',
      signal,
    });
    return await unwrapExcelBlob(data);
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function importSubjects(file: File, signal?: AbortSignal): Promise<ExcelImportResult> {
  const payload = new FormData();
  payload.append('file', file);
  try {
    const { data } = await apiClient.post<ApiResult<ExcelImportResult>>(
      API_ENDPOINTS.subjects.import,
      payload,
      { signal },
    );
    assertApiSuccess(data);
    return data.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}
