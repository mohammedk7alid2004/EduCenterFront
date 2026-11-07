export const APP_NAME = import.meta.env.VITE_APP_NAME ?? 'EduCenter';
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';
export const STORAGE_KEYS = { auth: 'educenter.auth', ui: 'educenter.ui', language: 'educenter.language' } as const;
export const ROUTES = { home: '/', login: '/login', forbidden: '/403', notFound: '/404', dashboard: '/dashboard' } as const;
export const API_ENDPOINTS = { auth: { login: '/auth/login', refresh: '/auth/refresh', logout: '/auth/logout' }, template: { detail: (id: string) => `/template/${id}` } } as const;
export const QUERY_KEYS = { auth: ['auth'] } as const;
