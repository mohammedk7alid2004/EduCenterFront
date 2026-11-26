import { API_ENDPOINTS } from '@/shared/constants';
import { apiClient, assertApiSuccess, normalizeApiError } from '@/shared/api';
import type { ApiResult, PaginatedResult } from '@/shared/types';
import type { GroupDto, GroupFilters, StudentOption, GroupLocalizedName } from '../types';

const endpoints = API_ENDPOINTS.groups;

export async function fetchGroups(
  filters: GroupFilters = {},
  signal?: AbortSignal,
): Promise<PaginatedResult<GroupDto>> {
  try {
    const { data } = await apiClient.get<ApiResult<PaginatedResult<GroupDto>>>(endpoints.getAll, {
      signal,
      params: {
        Search: filters.name,
        PageNumber: filters.pageNumber,
        PageSize: filters.pageSize,
        IsActive: filters.isActive,
        SubjectId: filters.subjectId,
        TeacherId: filters.teacherId,
        ClassroomId: filters.classroomId,
      },
    });
    assertApiSuccess(data);
    return data.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function fetchGroup(id: string, signal?: AbortSignal): Promise<GroupDto> {
  try {
    const { data } = await apiClient.get<ApiResult<GroupDto>>(endpoints.detail(id), { signal });
    assertApiSuccess(data);
    return data.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function fetchStudentsOption(
  gradeId?: string,
  search?: string,
  signal?: AbortSignal,
): Promise<StudentOption[]> {
  try {
    const { data } = await apiClient.get<ApiResult<StudentOption[]>>(endpoints.students, {
      signal,
      params: {
        gradeId: gradeId || undefined,
        name: search || undefined,
      },
    });
    assertApiSuccess(data);
    return data.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export interface GroupOptionItem {
  id: string;
  name: GroupLocalizedName;
}

export async function fetchGroupOptions(
  kind: 'levels' | 'grades' | 'subjects',
  parentId?: string,
  signal?: AbortSignal,
): Promise<GroupOptionItem[]> {
  try {
    const { data } = await apiClient.get<ApiResult<GroupOptionItem[]>>(endpoints[kind], {
      signal,
      params: kind === 'grades' ? { parentId } : undefined,
    });
    assertApiSuccess(data);
    return data.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}
