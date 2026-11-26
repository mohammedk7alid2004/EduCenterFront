import { API_ENDPOINTS } from '@/shared/constants';
import { apiClient, assertApiSuccess, normalizeApiError } from '@/shared/api';
import type { ApiResult, PaginatedResult } from '@/shared/types';
import type { StudentDto, StudentFilters, StudentOption } from '../types';

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
