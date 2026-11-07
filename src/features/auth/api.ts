import { API_ENDPOINTS, type Role } from '@/config';
import { apiClient, ApiError, normalizeApiError } from '@/core/api';
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
      throw new ApiError('UNAUTHORIZED', data.statusCode || 401);
    }

    const payload = data.data;

    // Normalize roles into typed Role[]
    const roleString = payload.role?.toLowerCase() ?? 'teacher';
    const role: Role = (roleString as Role) || 'teacher';

    return {
      accessToken: payload.token,
      refreshToken: payload.refreshToken,
      user: {
        id: payload.userId,
        name: payload.fullName || payload.userId,
        roles: [role],
        permissions: payload.permissions ? [...payload.permissions] : [],
      },
    };
  } catch (error) {
    throw normalizeApiError(error);
  }
}
