import { beforeEach, describe, expect, it, vi } from 'vitest';
import { API_ENDPOINTS } from '@/shared/constants';
import { apiClient } from '@/shared/api';
import { fetchClassrooms } from './classrooms.queries.api';

vi.mock('@/shared/api', async () => ({
  ...(await vi.importActual<typeof import('@/shared/api')>('@/shared/api')),
  apiClient: { get: vi.fn() },
}));

describe('classroom query API contract', () => {
  beforeEach(() => vi.clearAllMocks());

  it('preserves an empty result and sends search, paging, inactive state and cancellation', async () => {
    const data = { items: [], pageNumber: 2, totalCount: 0, totalPages: 0 };
    vi.mocked(apiClient.get).mockResolvedValue({ data: { isSuccess: true, data } });
    const signal = new AbortController().signal;
    expect(
      await fetchClassrooms({ name: 'hall', pageNumber: 2, pageSize: 25, isActive: false }, signal),
    ).toEqual(data);
    expect(apiClient.get).toHaveBeenCalledWith(API_ENDPOINTS.classrooms.getAll, {
      params: { Name: 'hall', PageNumber: 2, PageSize: 25, IsActive: false },
      signal,
    });
  });
});
