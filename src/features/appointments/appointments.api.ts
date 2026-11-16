import { API_ENDPOINTS } from '@/config';
import {
  apiClient,
  assertApiSuccess,
  normalizeApiError,
  type ApiResult,
  type PaginatedResult,
} from '@/core/api';
import type {
  AppointmentDto,
  AppointmentFilters,
  AppointmentValues,
  AppointmentOption,
  TeacherOption,
} from './appointments.types';
const endpoints = API_ENDPOINTS.appointments;
async function get<T>(
  url: string,
  signal?: AbortSignal,
  params?: Record<string, unknown>,
): Promise<T> {
  try {
    const { data } = await apiClient.get<ApiResult<T>>(url, { signal, params });
    assertApiSuccess(data);
    return data.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}
export function fetchAppointments(filters: AppointmentFilters = {}, signal?: AbortSignal) {
  return get<PaginatedResult<AppointmentDto>>(endpoints.getAll, signal, {
    Search: filters.name,
    PageNumber: filters.pageNumber,
    PageSize: filters.pageSize,
    IsActive: filters.isActive,
    SubjectId: filters.subjectId,
    TeacherId: filters.teacherId,
    ClassroomId: filters.classroomId,
  });
}
export function fetchAppointment(id: string, signal?: AbortSignal) {
  return get<AppointmentDto>(endpoints.detail(id), signal);
}
export function fetchAppointmentOptions(
  kind: 'subjects' | 'classrooms' | 'levels',
  signal?: AbortSignal,
) {
  return get<AppointmentOption[]>(endpoints[kind], signal);
}
export function fetchAppointmentTeachers(subjectId?: string, signal?: AbortSignal) {
  return get<TeacherOption[]>(endpoints.teachers, signal, { subjectId });
}
export async function saveAppointment(
  values: AppointmentValues,
  id?: string,
  signal?: AbortSignal,
): Promise<void> {
  const payload = {
    ...values,
    startTime: `${values.startTime.slice(0, 5)}:00`,
    endTime: `${values.endTime.slice(0, 5)}:00`,
  };
  try {
    const { data } = id
      ? await apiClient.put<ApiResult<boolean>>(endpoints.update, { id, ...payload }, { signal })
      : await apiClient.post<ApiResult<string>>(endpoints.create, payload, { signal });
    assertApiSuccess(data);
  } catch (error) {
    throw normalizeApiError(error);
  }
}
export async function deleteAppointments(ids: string[], signal?: AbortSignal): Promise<void> {
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
export async function setAppointmentStatus(
  id: string,
  status: number,
  signal?: AbortSignal,
): Promise<void> {
  try {
    const { data } = await apiClient.patch<ApiResult<boolean>>(endpoints.setStatus(id), null, {
      params: { status },
      signal,
    });
    assertApiSuccess(data);
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export function fetchAppointmentGrades(levelId: string, signal?: AbortSignal) {
  return get<AppointmentOption[]>(endpoints.grades, signal, { parentId: levelId });
}
