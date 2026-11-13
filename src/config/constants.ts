export const APP_NAME = import.meta.env.VITE_APP_NAME ?? 'EduCenter';
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'https://educenter2.runasp.net/api';
export const STORAGE_KEYS = {
  auth: 'educenter.auth',
  ui: 'educenter.ui',
  language: 'educenter.language',
  splashShown: 'educenter.splash_shown',
} as const;
export const ROUTES = {
  home: '/',
  login: '/login',
  forgotPassword: '/forgot-password',
  forbidden: '/403',
  notFound: '/404',
  dashboard: '/dashboard',
  subjects: '/subjects',
  teachers: '/teachers',
} as const;
export const API_ENDPOINTS = {
  auth: {
    login: '/Auth/dashboard/login',
    refresh: '/Auth/refresh-token',
    logout: '/Auth/logout',
    forgotPassword: '/Auth/forgot-password',
    verifyResetOtp: '/Auth/verify-reset-otp',
    resetPassword: '/Auth/reset-password',
  },
  template: {
    detail: (id: string) => `/template/${id}`,
  },
  subjects: {
    getAll: '/v1/Subjects/GetAll',
    getById: (id: string) => `/v1/Subjects/ShowOneDetails/${id}`,
    create: '/v1/Subjects/Create',
    update: '/v1/Subjects/Update',
    delete: '/v1/Subjects/Delete',
    toggleStatus: (id: string) => `/v1/Subjects/ToggleStatus/${id}`,
  },
  teachers: {
    getAll: '/v1/Teachers',
    getById: (id: string) => `/v1/Teachers/${id}`,
    create: '/v1/Teachers',
    update: '/v1/Teachers',
    delete: '/v1/Teachers',
    toggleStatus: (id: string) => `/v1/Teachers/toggle-status/${id}`,
  },
} as const;
export const QUERY_KEYS = {
  auth: ['auth'],
  subjects: ['subjects'],
  teachers: ['teachers'],
} as const;
