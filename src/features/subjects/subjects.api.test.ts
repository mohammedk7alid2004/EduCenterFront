import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient, ApiError } from '@/core/api';
import { createSubject, fetchSubjects } from './subjects.api';
vi.mock('@/core/api', async () => ({
  ...(await vi.importActual<typeof import('@/core/api')>('@/core/api')),
  apiClient: { get: vi.fn(), post: vi.fn() },
}));
describe('subjects API contract', () => {
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
  it('returns the created ID for the separate status operation', async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({ data: { isSuccess: true, data: 'new-id' } });
    expect(await createSubject({ nameAr: '', nameEn: 'Physics' })).toBe('new-id');
  });
  it('rejects unsuccessful response envelopes even when HTTP succeeds', async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      data: { isSuccess: false, statusCode: 400, message: 'Subject already exists' },
    });
    await expect(createSubject({ nameAr: '', nameEn: 'Physics' })).rejects.toMatchObject({
      name: 'ApiError',
      message: 'Subject already exists',
    } satisfies Partial<ApiError>);
  });
});
