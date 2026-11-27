import { API_ENDPOINTS } from '@/shared/constants';
import { apiClient, assertApiSuccess, normalizeApiError } from '@/shared/api';
import type { ApiResult } from '@/shared/types';
import { DASHBOARD_NOTIFICATION_PAGE_SIZE } from '../constants';
import type { DashboardNotificationsFeedDto } from '../types';

const endpoints = API_ENDPOINTS.dashboardNotifications;

export async function fetchDashboardNotifications(
  pageNumber = 1,
  pageSize = DASHBOARD_NOTIFICATION_PAGE_SIZE,
  signal?: AbortSignal,
): Promise<DashboardNotificationsFeedDto> {
  try {
    const { data } = await apiClient.get<ApiResult<DashboardNotificationsFeedDto>>(
      endpoints.getAll,
      {
        signal,
        params: { pageNumber, pageSize },
      },
    );
    assertApiSuccess(data);
    return data.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}
