import type { Role } from '@/config';

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface BackendLoginData {
  token: string;
  tokenExpiresAt: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
  userId: string;
  fullName: string;
  role: string;
  permissions?: string[];
}

export interface BackendResponse<T> {
  isSuccess: boolean;
  message: string;
  statusCode: number;
  data: T;
}

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    roles: Role[];
    roleName?: string;
    permissions?: string[];
  };
}
