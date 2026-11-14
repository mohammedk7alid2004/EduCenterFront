import { API_ENDPOINTS } from '@/config';
import {
  apiClient,
  assertApiSuccess,
  normalizeApiError,
  type ApiResult,
  type ListFilters,
  type PaginatedResult,
} from '@/core/api';
import type { ClassroomDto, ClassroomValues } from './classrooms.types';
export async function fetchClassrooms(
  filters: ListFilters = {},
  signal?: AbortSignal,
): Promise<PaginatedResult<ClassroomDto>> {
  try {
    const { data } = await apiClient.get<ApiResult<PaginatedResult<ClassroomDto>>>(
      API_ENDPOINTS.classrooms.getAll,
      {
        params: {
          Name: filters.name,
          PageNumber: filters.pageNumber,
          PageSize: filters.pageSize,
          IsActive: filters.isActive,
        },
        signal,
      },
    );
    assertApiSuccess(data);
    return data.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}
export async function fetchClassroom(id: string, signal?: AbortSignal): Promise<ClassroomDto> {
  try {
    const { data } = await apiClient.get<ApiResult<ClassroomDto>>(
      API_ENDPOINTS.classrooms.getById(id),
      { signal },
    );
    assertApiSuccess(data);
    return data.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}
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
