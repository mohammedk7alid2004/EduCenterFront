import { API_ENDPOINTS } from '@/shared/constants';
import { apiClient, assertApiSuccess, normalizeApiError } from '@/shared/api';
import type { ApiResult } from '@/shared/types';
import type { StudentDto, StudentValues, StudentFilters, StudentImportResult } from '../types';

const endpoints = API_ENDPOINTS.students;

export async function saveStudent(
  values: StudentValues,
  id?: string,
  signal?: AbortSignal,
): Promise<void> {
  const { password, confirmPassword, gender, ...rest } = values;
  const payload = {
    ...rest,
    gender: Number(gender),
    ...(!id || password ? { password, confirmPassword } : {}),
  };
  try {
    const { data } = id
      ? await apiClient.put<ApiResult<boolean>>(endpoints.update, { id, ...payload }, { signal })
      : await apiClient.post<ApiResult<StudentDto>>(endpoints.create, payload, { signal });
    assertApiSuccess(data);
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function deleteStudents(ids: string[], signal?: AbortSignal): Promise<void> {
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

export async function toggleStudentStatus(id: string, signal?: AbortSignal): Promise<void> {
  try {
    const { data } = await apiClient.patch<ApiResult<boolean>>(endpoints.toggleStatus(id), null, {
      signal,
    });
    assertApiSuccess(data);
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function exportStudents(filters: StudentFilters, signal?: AbortSignal): Promise<Blob> {
  try {
    const { data } = await apiClient.get<Blob>(endpoints.export, {
      responseType: 'blob',
      signal,
      params: {
        Search: filters.name,
        IsActive: filters.isActive,
        EducationLevelId: filters.educationLevelId,
        EducationGradeId: filters.educationGradeId,
        Gender: filters.gender,
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

export async function fetchStudentTemplate(signal?: AbortSignal): Promise<Blob> {
  try {
    const { data } = await apiClient.get<Blob>(endpoints.template, {
      responseType: 'blob',
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

export async function importStudents(
  file: File,
  signal?: AbortSignal,
): Promise<StudentImportResult> {
  const payload = new FormData();
  payload.append('file', file);
  try {
    const { data } = await apiClient.post<ApiResult<StudentImportResult>>(
      endpoints.import,
      payload,
      { signal },
    );
    assertApiSuccess(data);
    return data.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}
