import { beforeEach, describe, expect, it, vi } from 'vitest';
import { API_ENDPOINTS } from '@/config';
import { apiClient } from '@/core/api';
import { updateRole } from './roles.api';

vi.mock('@/core/api', async () => ({
  ...(await vi.importActual<typeof import('@/core/api')>('@/core/api')),
  apiClient: { put: vi.fn() },
}));
describe('role permission save contract', () => {
  beforeEach(() => vi.clearAllMocks());
  it.each([{ ids: ['selected-id'] }, { ids: [] }])(
    'sends the exact remaining grants, including revoking all: %j',
    async ({ ids }) => {
      vi.mocked(apiClient.put).mockResolvedValueOnce({ data: { isSuccess: true, data: true } });
      const signal = new AbortController().signal;
      await updateRole('role-id', { name: 'Reception', permissionIds: ids }, signal);
      expect(apiClient.put).toHaveBeenCalledWith(
        API_ENDPOINTS.roles.update('role-id'),
        {
          roleName: 'Reception',
          permissionIds: ids,
        },
        { signal },
      );
    },
  );
});
