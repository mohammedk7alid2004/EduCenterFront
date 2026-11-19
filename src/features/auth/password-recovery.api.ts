import { API_ENDPOINTS } from '@/config';
import { apiClient, ApiError, normalizeApiError } from '@/infrastructure/api';
import type { BackendResponse } from './types';
import type {
  PasswordResetRequest,
  ResetPasswordRequest,
  VerifyResetOtpRequest,
} from './password-recovery.types';

function throwFailedResponse<T>(response: BackendResponse<T>): never {
  const error = new ApiError('BAD_REQUEST', response.statusCode);
  error.message = response.message || error.message;
  throw error;
}

export async function requestPasswordReset(
  request: PasswordResetRequest,
  signal?: AbortSignal,
): Promise<void> {
  try {
    const { data } = await apiClient.post<BackendResponse<boolean>>(
      API_ENDPOINTS.auth.forgotPassword,
      { email: request.email.trim() },
      { signal },
    );
    if (!data.isSuccess) throwFailedResponse(data);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw normalizeApiError(error);
  }
}

export async function verifyResetOtp(
  request: VerifyResetOtpRequest,
  signal?: AbortSignal,
): Promise<string> {
  try {
    const { data } = await apiClient.post<BackendResponse<string>>(
      API_ENDPOINTS.auth.verifyResetOtp,
      { email: request.email.trim(), otp: request.otp },
      { signal },
    );
    if (!data.isSuccess || !data.data) throwFailedResponse(data);
    return data.data;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw normalizeApiError(error);
  }
}

export async function resetPassword(
  request: ResetPasswordRequest,
  signal?: AbortSignal,
): Promise<void> {
  try {
    const { data } = await apiClient.post<BackendResponse<boolean>>(
      API_ENDPOINTS.auth.resetPassword,
      {
        email: request.email.trim(),
        token: request.token,
        newPassword: request.newPassword,
        confirmPassword: request.confirmPassword,
      },
      { signal },
    );
    if (!data.isSuccess) throwFailedResponse(data);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw normalizeApiError(error);
  }
}
