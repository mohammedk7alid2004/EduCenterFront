import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '@/shared/api';
import { fetchNotifications } from './notifications.queries.api';
import { NOTIFICATION_TYPE } from '../constants';

vi.mock('@/shared/api', async () => ({
  ...(await vi.importActual<typeof import('@/shared/api')>('@/shared/api')),
  apiClient: { get: vi.fn() },
}));

describe('notifications query API contract', () => {
  beforeEach(() => vi.clearAllMocks());

  it('fetches paginated notifications with type and education filters', async () => {
    const data = { items: [], totalCount: 0, totalPages: 0, pageNumber: 1 };
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: { isSuccess: true, data } });
    const controller = new AbortController();

    expect(
      await fetchNotifications(
        { type: NOTIFICATION_TYPE.students, groupId: 'g-1', pageNumber: 1, pageSize: 10 },
        controller.signal,
      ),
    ).toEqual(data);

    expect(apiClient.get).toHaveBeenCalledWith(expect.any(String), {
      signal: controller.signal,
      params: {
        Search: undefined,
        PageNumber: 1,
        PageSize: 10,
        IsActive: undefined,
        Type: 1,
        GroupId: 'g-1',
        LevelId: undefined,
        GradeId: undefined,
      },
    });
  });
});
