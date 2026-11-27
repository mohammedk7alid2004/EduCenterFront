import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '@/shared/api';
import { API_ENDPOINTS } from '@/shared/constants';
import { fetchDashboardNotifications } from './dashboard-notifications.queries.api';

vi.mock('@/shared/api', async () => ({
  ...(await vi.importActual<typeof import('@/shared/api')>('@/shared/api')),
  apiClient: { get: vi.fn() },
}));

describe('dashboard notifications query API contract', () => {
  beforeEach(() => vi.clearAllMocks());

  it('fetches dashboard notifications feed with pagination params', async () => {
    const data = { items: [], unreadCount: 0, totalCount: 0, pageNumber: 1, totalPages: 1 };
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: { isSuccess: true, data } });
    const controller = new AbortController();

    expect(await fetchDashboardNotifications(1, 15, controller.signal)).toEqual(data);
    expect(apiClient.get).toHaveBeenCalledWith(API_ENDPOINTS.dashboardNotifications.getAll, {
      signal: controller.signal,
      params: { pageNumber: 1, pageSize: 15 },
    });
  });
});
