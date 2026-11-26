import { API_ENDPOINTS } from '@/shared/constants';
import { apiClient, assertApiSuccess, normalizeApiError } from '@/shared/api';
import type { ApiResult } from '@/shared/types';
import type { AttendanceFilters, AttendanceValues } from '../types';

const endpoints = API_ENDPOINTS.attendance;

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
