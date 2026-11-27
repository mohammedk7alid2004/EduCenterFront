import { API_ENDPOINTS } from '@/shared/constants';
import { apiClient, assertApiSuccess, normalizeApiError, unwrapExcelBlob } from '@/shared/api';
import type { ApiResult, ExcelImportResult, ListFilters } from '@/shared/types';
import type { ClassroomValues } from '../types';

export async function createClassroom(
  values: ClassroomValues,
  signal?: AbortSignal,
): Promise<string> {
  try {
    const { data } = await apiClient.post<ApiResult<string>>(
      API_ENDPOINTS.classrooms.create,
      values,
      { signal },
    );
    assertApiSuccess(data);
    return data.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function updateClassroom(
  id: string,
  values: ClassroomValues,
  signal?: AbortSignal,
): Promise<void> {
  try {
    const { data } = await apiClient.put<ApiResult<boolean>>(
      API_ENDPOINTS.classrooms.update,
      { id, ...values },
      { signal },
    );
    assertApiSuccess(data);
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function deleteClassrooms(ids: string[], signal?: AbortSignal): Promise<void> {
  try {
    const { data } = await apiClient.delete<ApiResult<boolean>>(API_ENDPOINTS.classrooms.delete, {
      data: { ids },
      signal,
    });
    assertApiSuccess(data);
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function toggleClassroomStatus(id: string, signal?: AbortSignal): Promise<void> {
  try {
    const { data } = await apiClient.patch<ApiResult<boolean>>(
      API_ENDPOINTS.classrooms.toggleStatus(id),
      null,
      { signal },
    );
    assertApiSuccess(data);
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function exportClassrooms(filters: ListFilters, signal?: AbortSignal): Promise<Blob> {
  try {
    const { data } = await apiClient.get<Blob>(API_ENDPOINTS.classrooms.export, {
      responseType: 'blob',
      signal,
      params: { Name: filters.name, IsActive: filters.isActive },
    });
    return await unwrapExcelBlob(data);
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function fetchClassroomTemplate(signal?: AbortSignal): Promise<Blob> {
  try {
    const { data } = await apiClient.get<Blob>(API_ENDPOINTS.classrooms.template, {
      responseType: 'blob',
      signal,
    });
    return await unwrapExcelBlob(data);
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function importClassrooms(
  file: File,
  signal?: AbortSignal,
): Promise<ExcelImportResult> {
  const payload = new FormData();
  payload.append('file', file);
  try {
    const { data } = await apiClient.post<ApiResult<ExcelImportResult>>(
      API_ENDPOINTS.classrooms.import,
      payload,
      { signal },
    );
    assertApiSuccess(data);
    return data.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}
