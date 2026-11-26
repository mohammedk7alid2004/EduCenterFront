import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '@/shared/constants';
import i18n from '@/app/config/i18n';
import { useAuthStore } from '@/shared/hooks/use-auth-store';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15_000,
});

let refreshPromise: Promise<string | null> | null = null;

interface RefreshTokenBackendResponse {
  isSuccess: boolean;
  message?: string;
  statusCode?: number;
  data?: {
    token: string;
    tokenExpiresAt: string;
    refreshToken: string;
    refreshTokenExpiresAt: string;
  };
}

async function requestNewAccessToken(): Promise<string | null> {
  const { refreshToken: currentRefreshToken, logout, setTokens } = useAuthStore.getState();

  if (!currentRefreshToken) {
    logout();
    return null;
  }

  if (!refreshPromise) {
    refreshPromise = axios
      .post<RefreshTokenBackendResponse>(
        `${API_BASE_URL}${API_ENDPOINTS.auth.refresh}`,
        { refreshToken: currentRefreshToken },
        { timeout: 10_000, headers: { 'Accept-Language': i18n.resolvedLanguage ?? i18n.language } },
      )
      .then(({ data }) => {
        const payload = data.data;
        if (data.isSuccess && payload?.token) {
          setTokens(payload.token, payload.refreshToken || currentRefreshToken);
          return payload.token;
        }
        logout();
        return null;
      })
      .catch(() => {
        logout();
        return null;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  config.headers['Accept-Language'] = i18n.resolvedLanguage ?? i18n.language;
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as
      (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

    if (
      error.response?.status === 401 &&
      original &&
      !original._retry &&
      !original.url?.includes(API_ENDPOINTS.auth.refresh) &&
      !original.url?.includes(API_ENDPOINTS.auth.login)
    ) {
      original._retry = true;
      const newToken = await requestNewAccessToken();
      if (newToken) {
        original.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(original);
      }
    }

    return Promise.reject(error);
  },
);
