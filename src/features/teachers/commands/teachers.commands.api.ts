import { API_ENDPOINTS } from '@/shared/constants';
import { apiClient, assertApiSuccess, normalizeApiError, unwrapExcelBlob } from '@/shared/api';
import type { ExcelImportResult } from '@/shared/types';
import type {
  ApiResult,
  CreateTeacherPayload,
  DeleteTeachersPayload,
  TeacherFilters,
  UpdateTeacherPayload,
} from '../types';

export async function createTeacher(
  payload: CreateTeacherPayload,
  signal?: AbortSignal,
): Promise<void> {
  try {
    const { data } = await apiClient.post<ApiResult<unknown>>(
      API_ENDPOINTS.teachers.create,
      payload,
      { signal },
    );
    assertApiSuccess(data);
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function updateTeacher(
  payload: UpdateTeacherPayload,
  signal?: AbortSignal,
): Promise<void> {
  try {
    const { data } = await apiClient.put<ApiResult<unknown>>(
      API_ENDPOINTS.teachers.update,
      payload,
      { signal },
    );
    assertApiSuccess(data);
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function deleteTeachers(
  payload: DeleteTeachersPayload,
  signal?: AbortSignal,
): Promise<void> {
  try {
    const { data } = await apiClient.delete<ApiResult<unknown>>(API_ENDPOINTS.teachers.delete, {
      data: payload,
      signal,
    });
    assertApiSuccess(data);
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function toggleTeacherStatus(id: string, signal?: AbortSignal): Promise<void> {
  try {
    const { data } = await apiClient.patch<ApiResult<unknown>>(
      API_ENDPOINTS.teachers.toggleStatus(id),
      null,
      { signal },
    );
    assertApiSuccess(data);
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function exportTeachers(filters: TeacherFilters, signal?: AbortSignal): Promise<Blob> {
  try {
    const params: Record<string, string | number | boolean> = {};
    if (filters.name) params['Name'] = filters.name;
    if (filters.email) params['Email'] = filters.email;
    if (filters.phoneNumber) params['PhoneNumber'] = filters.phoneNumber;
    if (filters.subjectId) params['SubjectId'] = filters.subjectId;
    if (filters.isActive !== undefined) params['IsActive'] = filters.isActive;
    const { data } = await apiClient.get<Blob>(API_ENDPOINTS.teachers.export, {
      responseType: 'blob',
      params,
      signal,
    });
    return await unwrapExcelBlob(data);
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function fetchTeacherTemplate(signal?: AbortSignal): Promise<Blob> {
  try {
    const { data } = await apiClient.get<Blob>(API_ENDPOINTS.teachers.template, {
      responseType: 'blob',
      signal,
    });
    return await unwrapExcelBlob(data);
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function importTeachers(file: File, signal?: AbortSignal): Promise<ExcelImportResult> {
  const payload = new FormData();
  payload.append('file', file);
  try {
    const { data } = await apiClient.post<ApiResult<ExcelImportResult>>(
      API_ENDPOINTS.teachers.import,
      payload,
      { signal },
    );
    assertApiSuccess(data);
    return data.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}
