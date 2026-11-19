import { API_ENDPOINTS, ROLES, type Role } from '@/config';
import { apiClient, ApiError, assertApiSuccess, normalizeApiError } from '@/infrastructure/api';
import type { BackendLoginData, BackendResponse, LoginCredentials, LoginResult } from './types';

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
