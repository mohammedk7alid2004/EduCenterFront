import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient, ApiError } from '@/shared/api';
import { createSubject } from './subjects.commands.api';

vi.mock('@/shared/api', async () => ({
  ...(await vi.importActual<typeof import('@/shared/api')>('@/shared/api')),
  apiClient: { post: vi.fn() },
}));

describe('subjects command API contract', () => {
  beforeEach(() => vi.clearAllMocks());

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
