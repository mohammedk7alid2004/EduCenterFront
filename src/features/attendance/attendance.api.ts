import { API_ENDPOINTS } from '@/config';
import {
  apiClient,
  assertApiSuccess,
  normalizeApiError,
  type ApiResult,
  type PaginatedResult,
} from '@/infrastructure/api';
import type {
  AttendanceDto,
  AttendanceFilters,
  AttendanceStudentOption,
  AttendanceAppointmentOption,
  AttendanceValues,
} from './attendance.types';
const endpoints = API_ENDPOINTS.attendance;
export async function fetchAttendance(
  filters: AttendanceFilters,
  signal?: AbortSignal,
): Promise<PaginatedResult<AttendanceDto>> {
  try {
    const { data } = await apiClient.get<ApiResult<PaginatedResult<AttendanceDto>>>(
      endpoints.getAll,
      {
        signal,
        params: {
          Search: filters.groupName || filters.name,
          Status: filters.status,
          AttendanceDate: filters.attendanceDate,
          PageNumber: filters.pageNumber,
          PageSize: filters.pageSize,
        },
      },
    );
    assertApiSuccess(data);
    return data.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}
export async function fetchAttendanceItem(
  id: string,
  signal?: AbortSignal,
): Promise<AttendanceDto> {
  try {
    const { data } = await apiClient.get<ApiResult<AttendanceDto>>(endpoints.detail(id), {
      signal,
    });
    assertApiSuccess(data);
    return data.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}
export async function fetchAttendanceStudents(
  signal?: AbortSignal,
): Promise<AttendanceStudentOption[]> {
  try {
    const { data } = await apiClient.get<ApiResult<AttendanceStudentOption[]>>(endpoints.students, {
      signal,
    });
    assertApiSuccess(data);
    return data.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}
export async function fetchAttendanceAppointmentOptions(
  studentId: string,
  signal?: AbortSignal,
): Promise<AttendanceAppointmentOption[]> {
  try {
    const { data } = await apiClient.get<ApiResult<AttendanceAppointmentOption[]>>(
      endpoints.appointmentOptions,
      { signal, params: { studentId } },
    );
    assertApiSuccess(data);
    return data.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}
export async function recordAttendance(
  values: AttendanceValues,
  signal?: AbortSignal,
): Promise<void> {
  try {
    const { data } = await apiClient.post<ApiResult<boolean>>(
      endpoints.record,
      { ...values, status: Number(values.status) },
      { signal },
    );
    assertApiSuccess(data);
  } catch (error) {
    throw normalizeApiError(error);
  }
}
