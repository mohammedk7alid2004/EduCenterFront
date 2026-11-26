import { API_ENDPOINTS } from '@/shared/constants';
import { apiClient, assertApiSuccess, normalizeApiError } from '@/shared/api';
import type { ApiResult, PaginatedList, TeacherDto, TeacherFilters } from '../types';

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
