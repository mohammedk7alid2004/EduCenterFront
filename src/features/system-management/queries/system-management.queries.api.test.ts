import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '@/shared/api';
import { fetchFaqs, fetchSettings } from './system-management.queries.api';
import { FAQ_ENDPOINTS, SYSTEM_TABS } from '../constants';

vi.mock('@/shared/api', async () => ({
  ...(await vi.importActual<typeof import('@/shared/api')>('@/shared/api')),
  apiClient: { get: vi.fn() },
}));

describe('system management query API contracts', () => {
  beforeEach(() => vi.clearAllMocks());

  it('uses the admin endpoint, cancellation and the real empty response', async () => {
    const result = { items: [], totalCount: 0, totalPages: 0, pageNumber: 2 };
    vi.mocked(apiClient.get).mockResolvedValue({ data: { isSuccess: true, data: result } });
    const signal = new AbortController().signal;
    expect(
      await fetchFaqs({ pageNumber: 2, pageSize: 25, name: 'query', isActive: false }, signal),
    ).toEqual(result);
    expect(apiClient.get).toHaveBeenCalledWith(FAQ_ENDPOINTS.base, {
      params: { PageNumber: 2, PageSize: 25, Name: 'query', IsActive: false },
      signal,
    });
  });

  it('surfaces application errors on settings fetch', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: { isSuccess: false, statusCode: 403, message: 'Denied' },
    });
    await expect(fetchSettings(SYSTEM_TABS[7].endpoint)).rejects.toMatchObject({
      name: 'ApiError',
      message: 'Denied',
    });
  });
});
