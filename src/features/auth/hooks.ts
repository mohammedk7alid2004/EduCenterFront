import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '@/core/auth';
import { loginUser } from './api';
import { requestPasswordReset, resetPassword, verifyResetOtp } from './password-recovery.api';
import type { LoginCredentials, LoginResult } from './types';
import type {
  PasswordResetRequest,
  ResetPasswordRequest,
  VerifyResetOtpRequest,
} from './password-recovery.types';
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
