import { beforeEach, describe, expect, it, vi } from 'vitest';
import { API_ENDPOINTS } from '@/shared/constants';
import { apiClient } from '@/shared/api';
import { updateRole } from './roles.commands.api';

vi.mock('@/shared/api', async () => ({
  ...(await vi.importActual<typeof import('@/shared/api')>('@/shared/api')),
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
