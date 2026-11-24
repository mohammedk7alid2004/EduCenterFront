import { API_ENDPOINTS } from '@/config';
import { apiClient, assertApiSuccess, normalizeApiError } from '@/infrastructure/api';
import type {
  ApiResult,
  CreateTeacherPayload,
  DeleteTeachersPayload,
  PaginatedList,
  TeacherDto,
  TeacherFilters,
  UpdateTeacherPayload,
} from './teachers.types';

export async function fetchTeachers(
  filters: TeacherFilters = {},
  signal?: AbortSignal,
): Promise<PaginatedList<TeacherDto>> {
  try {
    const params: Record<string, string | number | boolean> = {};
    if (filters.name) params['Name'] = filters.name;
    if (filters.email) params['Email'] = filters.email;
    if (filters.phoneNumber) params['PhoneNumber'] = filters.phoneNumber;
    if (filters.subjectId) params['SubjectId'] = filters.subjectId;
    if (filters.pageNumber !== undefined) params['PageNumber'] = filters.pageNumber;
    if (filters.pageSize !== undefined) params['PageSize'] = filters.pageSize;
    if (filters.isActive !== undefined) params['IsActive'] = filters.isActive;

    const { data } = await apiClient.get<ApiResult<PaginatedList<TeacherDto>>>(
      API_ENDPOINTS.teachers.getAll,
      { params, signal },
    );
    assertApiSuccess(data);
    return data.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function fetchTeacher(id: string, signal?: AbortSignal): Promise<TeacherDto> {
  try {
    const { data } = await apiClient.get<ApiResult<TeacherDto>>(
      API_ENDPOINTS.teachers.getById(id),
      { signal },
    );
    assertApiSuccess(data);
    return data.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

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
