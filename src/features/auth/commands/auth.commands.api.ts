import { API_ENDPOINTS } from '@/shared/constants';
import { ROLES, type Role } from '@/app/config';
import { apiClient, ApiError, assertApiSuccess, normalizeApiError } from '@/shared/api';
import type {
  BackendLoginData,
  BackendResponse,
  LoginCredentials,
  LoginResult,
  PasswordResetRequest,
  ResetPasswordRequest,
  VerifyResetOtpRequest,
} from '../types';

export async function loginUser(
  credentials: LoginCredentials,
  signal?: AbortSignal,
): Promise<LoginResult> {
  try {
    const { data } = await apiClient.post<BackendResponse<BackendLoginData>>(
      API_ENDPOINTS.auth.login,
      {
        email: credentials.email.trim(),
        password: credentials.password,
      },
      { signal },
    );

    if (!data.isSuccess || !data.data) {
      const error = new ApiError('UNAUTHORIZED', data.statusCode || 401);
      error.message = data.message || error.message;
      throw error;
    }

    const payload = data.data;

    const roleString = payload.role?.toLowerCase() ?? '';
    const role: Role = Object.values(ROLES).find((value) => value === roleString) ?? ROLES.staff;

    return {
      accessToken: payload.token,
      refreshToken: payload.refreshToken,
      user: {
        id: payload.userId,
        name: payload.fullName || payload.userId,
        roles: [role],
        roleName: payload.role,
        permissions: payload.permissions ? [...payload.permissions] : [],
      },
    };
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function logoutUser(refreshToken: string, signal?: AbortSignal): Promise<void> {
  try {
    const { data } = await apiClient.post<BackendResponse<boolean>>(
      API_ENDPOINTS.auth.logout,
      { refreshToken },
      { signal },
    );
    assertApiSuccess(data);
  } catch (error) {
    throw normalizeApiError(error);
  }
}

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
