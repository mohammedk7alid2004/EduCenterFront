import { API_ENDPOINTS } from '@/shared/constants';
import { apiClient, assertApiSuccess, normalizeApiError } from '@/shared/api';
import type { ApiResult } from '@/shared/types';

const endpoints = API_ENDPOINTS.dashboardNotifications;

export async function markDashboardNotificationRead(
  id: string,
  signal?: AbortSignal,
): Promise<boolean> {
  try {
    const { data } = await apiClient.post<ApiResult<boolean>>(endpoints.markRead(id), null, {
      signal,
    });
    assertApiSuccess(data);
    return data.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function markAllDashboardNotificationsRead(signal?: AbortSignal): Promise<number> {
  try {
    const { data } = await apiClient.post<ApiResult<number>>(endpoints.markAllRead, null, {
      signal,
    });
    assertApiSuccess(data);
    return data.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}
