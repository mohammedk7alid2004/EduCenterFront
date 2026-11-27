import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/shared/constants';
import type { ApiError } from '@/shared/api';
import { DASHBOARD_NOTIFICATION_PAGE_SIZE } from '../constants';
import type { DashboardNotificationsFeedDto } from '../types';
import { fetchDashboardNotifications } from './dashboard-notifications.queries.api';

export function useDashboardNotifications(
  pageNumber = 1,
  pageSize = DASHBOARD_NOTIFICATION_PAGE_SIZE,
  enabled = true,
) {
  return useQuery<DashboardNotificationsFeedDto, ApiError>({
    queryKey: [...QUERY_KEYS.dashboardNotifications, pageNumber, pageSize],
    queryFn: ({ signal }) => fetchDashboardNotifications(pageNumber, pageSize, signal),
    enabled,
  });
}
