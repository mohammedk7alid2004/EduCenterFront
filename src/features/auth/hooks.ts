import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '@/core/auth';
import { loginUser } from './api';
import type { LoginCredentials, LoginResult } from './types';
import type { ApiError } from '@/core/api';

export function useLogin() {
  const setSession = useAuthStore((state) => state.setSession);

  return useMutation<LoginResult, ApiError, LoginCredentials>({
    mutationFn: (credentials) => loginUser(credentials),
    onSuccess: (data) => {
      setSession(data.accessToken, data.refreshToken, data.user);
    },
  });
}
