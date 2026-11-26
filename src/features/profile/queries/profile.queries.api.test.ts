import { beforeEach, describe, expect, it, vi } from 'vitest';
import { API_ENDPOINTS } from '@/shared/constants';
import { apiClient } from '@/shared/api';
import { fetchProfile } from './profile.queries.api';

vi.mock('@/shared/api', async () => ({
  ...(await vi.importActual<typeof import('@/shared/api')>('@/shared/api')),
  apiClient: { get: vi.fn() },
}));

describe('profile query API contract', () => {
  beforeEach(() => vi.clearAllMocks());

  it('loads the authenticated profile without a user id parameter', async () => {
    const data = { id: 'user-id', fullName: 'Name', email: 'name@example.com' };
    vi.mocked(apiClient.get).mockResolvedValue({ data: { isSuccess: true, data } });
    const signal = new AbortController().signal;
    expect(await fetchProfile(signal)).toEqual(data);
    expect(apiClient.get).toHaveBeenCalledWith(API_ENDPOINTS.auth.profile, { signal });
  });
});
