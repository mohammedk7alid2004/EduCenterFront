import { API_ENDPOINTS } from '@/config';
import { apiClient, normalizeApiError } from '@/core/api';
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
    return data.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function createSubject(
  payload: CreateSubjectPayload,
  signal?: AbortSignal,
): Promise<void> {
  try {
    await apiClient.post(API_ENDPOINTS.subjects.create, payload, { signal });
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function updateSubject(
  payload: UpdateSubjectPayload,
  signal?: AbortSignal,
): Promise<void> {
  try {
    await apiClient.put(API_ENDPOINTS.subjects.update, payload, { signal });
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function deleteSubjects(
  payload: DeleteSubjectsPayload,
  signal?: AbortSignal,
): Promise<void> {
  try {
    await apiClient.delete(API_ENDPOINTS.subjects.delete, { data: payload, signal });
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function toggleSubjectStatus(id: string, signal?: AbortSignal): Promise<void> {
  try {
    await apiClient.patch(API_ENDPOINTS.subjects.toggleStatus(id), null, { signal });
  } catch (error) {
    throw normalizeApiError(error);
  }
}
