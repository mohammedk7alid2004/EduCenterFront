import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '@/shared/api';
import { fetchSubjects } from './subjects.queries.api';

vi.mock('@/shared/api', async () => ({
  ...(await vi.importActual<typeof import('@/shared/api')>('@/shared/api')),
  apiClient: { get: vi.fn() },
}));

describe('subjects query API contract', () => {
  beforeEach(() => vi.clearAllMocks());

  it('preserves an empty result and sends inactive filters and cancellation', async () => {
    const data = { items: [], totalCount: 0, totalPages: 0, pageNumber: 2 };
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: { isSuccess: true, data } });
    const controller = new AbortController();
    expect(
      await fetchSubjects({ isActive: false, pageNumber: 2, pageSize: 25 }, controller.signal),
    ).toEqual(data);
    expect(apiClient.get).toHaveBeenCalledWith(expect.any(String), {
      params: { IsActive: false, PageNumber: 2, PageSize: 25 },
      signal: controller.signal,
    });
  });
});
