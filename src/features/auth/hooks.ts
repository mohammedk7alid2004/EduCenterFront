import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/core/auth';
import { loginUser, logoutUser } from './api';
import { requestPasswordReset, resetPassword, verifyResetOtp } from './password-recovery.api';
import type { LoginCredentials, LoginResult } from './types';
import type {
  PasswordResetRequest,
  ResetPasswordRequest,
  VerifyResetOtpRequest,
} from './password-recovery.types';
import type { ApiError } from '@/core/api';

export function useLogin() {
  return useMutation<LoginResult, ApiError, LoginCredentials>({
    mutationFn: (credentials) => loginUser(credentials),
  });
}

export function useRequestPasswordReset() {
  return useMutation<void, ApiError, PasswordResetRequest>({
    mutationFn: (request) => requestPasswordReset(request),
  });
}

export function useVerifyResetOtp() {
  return useMutation<string, ApiError, VerifyResetOtpRequest>({
    mutationFn: (request) => verifyResetOtp(request),
  });
}

export function useResetPassword() {
  return useMutation<void, ApiError, ResetPasswordRequest>({
    mutationFn: (request) => resetPassword(request),
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation<void, ApiError>({
    mutationFn: async () => {
      const refreshToken = useAuthStore.getState().refreshToken;
      if (refreshToken) await logoutUser(refreshToken);
    },
    onSettled: () => {
      useAuthStore.getState().logout();
      queryClient.clear();
    },
  });
}
