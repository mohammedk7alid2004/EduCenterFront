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
  RecordedAttendance,
} from './attendance.types';
const endpoints = API_ENDPOINTS.attendance;
type RawAppointmentOption = Omit<AttendanceAppointmentOption, 'days'> & {
  days?: (number | string)[];
};
const WEEKDAY_NAMES = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
];
function normalizeWeekday(day: number | string): number {
  return typeof day === 'number' ? day : WEEKDAY_NAMES.indexOf(day.toLowerCase());
}
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
    const { data } = await apiClient.get<ApiResult<RawAppointmentOption[]>>(
      endpoints.appointmentOptions,
      { signal, params: { studentId } },
    );
    assertApiSuccess(data);
    return data.data.map((option) => ({
      ...option,
      days: (option.days ?? []).map((day) => normalizeWeekday(day)),
    }));
  } catch (error) {
    throw normalizeApiError(error);
  }
}
export async function fetchRecordedAttendance(
  params: { studentId: string; appointmentId: string; sessionDate: string },
  signal?: AbortSignal,
): Promise<RecordedAttendance | null> {
  try {
    const { data } = await apiClient.get<ApiResult<RecordedAttendance | null>>(
      endpoints.recorded,
      { signal, params },
    );
    assertApiSuccess(data);
    return data.data ?? null;
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
      {
        studentId: values.studentId,
        appointmentId: values.appointmentId,
        sessionDate: values.sessionDate,
        status: Number(values.status),
        notes: values.notes,
      },
      { signal },
    );
    assertApiSuccess(data);
  } catch (error) {
    throw normalizeApiError(error);
  }
}
export async function exportAttendance(
  filters: AttendanceFilters,
  signal?: AbortSignal,
): Promise<Blob> {
  try {
    const { data } = await apiClient.get<Blob>(endpoints.export, {
      responseType: 'blob',
      signal,
      params: {
        Search: filters.groupName || filters.name,
        Status: filters.status,
        AttendanceDate: filters.attendanceDate,
      },
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
