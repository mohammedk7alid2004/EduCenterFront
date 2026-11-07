import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '@/config';
import { useAuthStore } from '@/core/auth/auth-store';

export const apiClient = axios.create({ baseURL: API_BASE_URL, timeout: 15_000 });
let refreshPromise: Promise<string | null> | null = null;
async function refreshToken(): Promise<string | null> { if (!refreshPromise) refreshPromise = apiClient.post<{ accessToken: string }>(API_ENDPOINTS.auth.refresh).then(({ data }) => { useAuthStore.getState().setAccessToken(data.accessToken); return data.accessToken; }).catch(() => { useAuthStore.getState().logout(); return null; }).finally(() => { refreshPromise = null; }); return refreshPromise; }
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => { const token = useAuthStore.getState().accessToken; if (token) config.headers.Authorization = `Bearer ${token}`; return config; });
apiClient.interceptors.response.use((response) => response, async (error: AxiosError) => { const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean }; if (error.response?.status === 401 && !original?._retry && !original.url?.includes(API_ENDPOINTS.auth.refresh)) { original._retry = true; const token = await refreshToken(); if (token) { original.headers.Authorization = `Bearer ${token}`; return apiClient(original); } } return Promise.reject(error); });
