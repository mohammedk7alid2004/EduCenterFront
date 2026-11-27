import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '@/shared/api';
import { API_ENDPOINTS } from '@/shared/constants';
import { fetchEmployees } from './employees.queries.api';

vi.mock('@/shared/api', async () => ({
  ...(await vi.importActual<typeof import('@/shared/api')>('@/shared/api')),
  apiClient: { get: vi.fn() },
}));

describe('employees query API contract', () => {
  beforeEach(() => vi.clearAllMocks());

  it('sends unified Search, RoleId, and IsActive filters with cancellation signal', async () => {
    const payload = { items: [], totalCount: 0, totalPages: 1, pageNumber: 1 };
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: { isSuccess: true, data: payload } });
    const controller = new AbortController();

    expect(
      await fetchEmployees(
        {
          name: '01012345678',
          roleId: 'role-1',
          isActive: true,
          pageNumber: 1,
          pageSize: 10,
        },
        controller.signal,
      ),
    ).toEqual(payload);

    expect(apiClient.get).toHaveBeenCalledWith(API_ENDPOINTS.employees.getAll, {
      signal: controller.signal,
      params: {
        Search: '01012345678',
        RoleId: 'role-1',
        IsActive: true,
        PageNumber: 1,
        PageSize: 10,
      },
    });
  });
});
