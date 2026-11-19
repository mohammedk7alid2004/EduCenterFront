import { API_ENDPOINTS } from '@/config';
import { apiClient, assertApiSuccess, normalizeApiError } from '@/infrastructure/api';
import type {
  ApiResult,
  CreateSubjectPayload,
  DeleteSubjectsPayload,
  PaginatedList,
  SubjectDetail,
  SubjectDto,
  SubjectFilters,
  UpdateSubjectPayload,
} from './subjects.types';

export async function fetchSubjects(
  filters: SubjectFilters = {},
  signal?: AbortSignal,
): Promise<PaginatedList<SubjectDto>> {
  try {
    const params: Record<string, string | number | boolean> = {};
    if (filters.name) params['Name'] = filters.name;
    if (filters.pageNumber !== undefined) params['PageNumber'] = filters.pageNumber;
    if (filters.pageSize !== undefined) params['PageSize'] = filters.pageSize;
    if (filters.isActive !== undefined) params['IsActive'] = filters.isActive;

    const { data } = await apiClient.get<ApiResult<PaginatedList<SubjectDto>>>(
      API_ENDPOINTS.subjects.getAll,
      { params, signal },
    );
    assertApiSuccess(data);
    return data.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function fetchSubject(id: string, signal?: AbortSignal): Promise<SubjectDetail> {
  try {
    const { data } = await apiClient.get<ApiResult<SubjectDetail>>(
      API_ENDPOINTS.subjects.getById(id),
      { signal },
    );
    assertApiSuccess(data);
    return data.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

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
