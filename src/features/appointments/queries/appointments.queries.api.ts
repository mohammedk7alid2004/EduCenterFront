import { API_ENDPOINTS } from '@/shared/constants';
import { apiClient, assertApiSuccess, normalizeApiError } from '@/shared/api';
import type { ApiResult, PaginatedResult } from '@/shared/types';
import type {
  AppointmentDto,
  AppointmentFilters,
  AppointmentOption,
  TeacherOption,
} from '../types';

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

export function fetchAppointmentGrades(levelId: string, signal?: AbortSignal) {
  return get<AppointmentOption[]>(endpoints.grades, signal, { parentId: levelId });
}
