import { API_ENDPOINTS } from '@/shared/constants';
import { apiClient, assertApiSuccess, normalizeApiError } from '@/shared/api';
import type { ApiResult, PaginatedResult } from '@/shared/types';
import type {
  AttendanceDto,
  AttendanceFilters,
  AttendanceStudentOption,
  AttendanceAppointmentOption,
  RecordedAttendance,
} from '../types';

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

export async function fetchAllAttendanceForExport(
  filters: AttendanceFilters,
  signal?: AbortSignal,
): Promise<AttendanceDto[]> {
  const rows: AttendanceDto[] = [];
  let pageNumber = 1;
  let totalPages = 1;

  do {
    const page = await fetchAttendance({ ...filters, pageNumber, pageSize: 100 }, signal);
    rows.push(...page.items);
    totalPages = page.totalPages;
    pageNumber += 1;
  } while (pageNumber <= totalPages);

  return rows;
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
    const { data } = await apiClient.get<ApiResult<RecordedAttendance | null>>(endpoints.recorded, {
      signal,
      params,
    });
    assertApiSuccess(data);
    return data.data ?? null;
  } catch (error) {
    throw normalizeApiError(error);
  }
}
