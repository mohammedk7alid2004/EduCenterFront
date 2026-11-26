import { API_ENDPOINTS } from '@/config';
import {
  apiClient,
  assertApiSuccess,
  normalizeApiError,
  type ApiResult,
  type PaginatedResult,
} from '@/infrastructure/api';
import type {
  StudentDto,
  StudentValues,
  StudentFilters,
  StudentOption,
  StudentImportResult,
} from './students.types';
const endpoints = API_ENDPOINTS.students;
export async function fetchStudents(
  filters: StudentFilters,
  signal?: AbortSignal,
): Promise<PaginatedResult<StudentDto>> {
  try {
    const { data } = await apiClient.get<ApiResult<PaginatedResult<StudentDto>>>(endpoints.getAll, {
      signal,
      params: {
        Search: filters.name,
        PageNumber: filters.pageNumber,
        PageSize: filters.pageSize,
        IsActive: filters.isActive,
        EducationLevelId: filters.educationLevelId,
        EducationGradeId: filters.educationGradeId,
        Gender: filters.gender,
      },
    });
    assertApiSuccess(data);
    return data.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}
export async function fetchStudent(id: string, signal?: AbortSignal): Promise<StudentDto> {
  try {
    const { data } = await apiClient.get<ApiResult<StudentDto>>(endpoints.detail(id), { signal });
    assertApiSuccess(data);
    return data.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}
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
export async function fetchStudentEducation(
  kind: 'levels' | 'grades',
  levelId?: string,
  signal?: AbortSignal,
): Promise<StudentOption[]> {
  try {
    const { data } = await apiClient.get<ApiResult<StudentOption[]>>(endpoints[kind], {
      signal,
      params: kind === 'grades' ? { parentId: levelId } : undefined,
    });
    assertApiSuccess(data);
    return data.data;
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
