import type { AxiosError } from 'axios';

export type ApiErrorCode = 'NETWORK' | 'TIMEOUT' | 'BAD_REQUEST' | 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'CONFLICT' | 'VALIDATION' | 'SERVER' | 'UNKNOWN';
export class ApiError extends Error { constructor(public readonly code: ApiErrorCode, public readonly status?: number, public readonly fieldErrors: Record<string, string[]> = {}) { super(`errors.${code.toLowerCase()}`); this.name = 'ApiError'; } }
export function normalizeApiError(error: unknown): ApiError { const axiosError = error as AxiosError<{ errors?: Record<string, string[]> }>;
  if (axiosError.code === 'ECONNABORTED') return new ApiError('TIMEOUT');
  if (!axiosError.response) return new ApiError('NETWORK');
  const map: Record<number, ApiErrorCode> = { 400: 'BAD_REQUEST', 401: 'UNAUTHORIZED', 403: 'FORBIDDEN', 404: 'NOT_FOUND', 409: 'CONFLICT', 422: 'VALIDATION' };
  const status = axiosError.response.status; return new ApiError(map[status] ?? (status >= 500 ? 'SERVER' : 'UNKNOWN'), status, axiosError.response.data?.errors ?? {});
}
