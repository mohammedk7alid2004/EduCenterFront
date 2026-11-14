import { act, renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { PropsWithChildren } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/core/api';
import { useAuthStore } from '@/core/auth';
import { ROLES } from '@/config';
import { changePassword } from './profile.api';
import { useChangePassword } from './profile.queries';
vi.mock('./profile.api', () => ({
  changePassword: vi.fn(),
  fetchProfile: vi.fn(),
  updateProfile: vi.fn(),
}));
describe('password change session handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({
      accessToken: 'old-token',
      refreshToken: 'old-refresh',
      user: { id: 'user-id', name: 'Name', roles: [ROLES.staff] },
    });
  });
  it.each([true, false])(
    'ends the session only when the backend confirms success: %s',
    async (success) => {
      if (success) vi.mocked(changePassword).mockResolvedValue();
      else vi.mocked(changePassword).mockRejectedValue(new ApiError('BAD_REQUEST', 400));
      const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
      client.setQueryData(['private-data'], 'private');
      const wrapper = ({ children }: PropsWithChildren) => (
        <QueryClientProvider client={client}>{children}</QueryClientProvider>
      );
      const { result } = renderHook(() => useChangePassword(), { wrapper });
      const values = {
        currentPassword: 'Old123!',
        newPassword: 'New12345!',
        confirmPassword: 'New12345!',
      };
      await act(async () => {
        if (success) await result.current.mutateAsync(values);
        else await expect(result.current.mutateAsync(values)).rejects.toThrow();
      });
      expect(useAuthStore.getState().accessToken).toBe(success ? null : 'old-token');
      expect(client.getQueryData(['private-data'])).toBe(success ? undefined : 'private');
      client.clear();
    },
  );
});
