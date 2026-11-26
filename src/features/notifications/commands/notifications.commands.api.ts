import { API_ENDPOINTS } from '@/shared/constants';
import { apiClient, assertApiSuccess, normalizeApiError } from '@/shared/api';
import type { ApiResult } from '@/shared/types';
import type { NotificationValues } from '../types';

const endpoints = API_ENDPOINTS.notifications;

function buildFormData(values: NotificationValues): FormData {
  const fd = new FormData();
  fd.append('title', values.title);
  fd.append('type', String(values.type));
  if (values.groupId) fd.append('groupId', values.groupId);
  if (values.levelId) fd.append('levelId', values.levelId);
  if (values.gradeId) fd.append('gradeId', values.gradeId);
  fd.append('message', values.message);
  if (values.image) fd.append('image', values.image);
  if (values.removeImage) fd.append('removeImage', 'true');
  return fd;
}

export async function createNotification(
  values: NotificationValues,
  signal?: AbortSignal,
): Promise<void> {
  try {
    const { data } = await apiClient.post<ApiResult<string>>(
      endpoints.create,
      buildFormData(values),
      { signal, headers: { 'Content-Type': 'multipart/form-data' } },
    );
    assertApiSuccess(data);
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function updateNotification(
  id: string,
  values: NotificationValues,
  signal?: AbortSignal,
): Promise<void> {
  const fd = buildFormData(values);
  fd.append('id', id);
  try {
    const { data } = await apiClient.put<ApiResult<boolean>>(endpoints.update, fd, {
      signal,
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    assertApiSuccess(data);
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function deleteNotifications(ids: string[], signal?: AbortSignal): Promise<void> {
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

export async function resendNotification(id: string, signal?: AbortSignal): Promise<void> {
  try {
    const { data } = await apiClient.post<ApiResult<boolean>>(endpoints.resend(id), null, {
      signal,
    });
    assertApiSuccess(data);
  } catch (error) {
    throw normalizeApiError(error);
  }
}
