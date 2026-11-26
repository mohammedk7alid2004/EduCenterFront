import { API_ENDPOINTS } from '@/shared/constants';
import { apiClient, assertApiSuccess, normalizeApiError } from '@/shared/api';
import type { ApiResult } from '@/shared/types';
import type { AppointmentFilters, AppointmentValues } from '../types';

const endpoints = API_ENDPOINTS.appointments;

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

export async function exportAppointments(
  filters: AppointmentFilters,
  signal?: AbortSignal,
): Promise<Blob> {
  try {
    const { data } = await apiClient.get<Blob>(endpoints.export, {
      responseType: 'blob',
      signal,
      params: {
        Search: filters.name,
        IsActive: filters.isActive,
        SubjectId: filters.subjectId,
        TeacherId: filters.teacherId,
        ClassroomId: filters.classroomId,
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
