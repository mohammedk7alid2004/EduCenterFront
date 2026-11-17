export const FEEDBACK_DISMISS_DELAY_MS = 2500;
export const SIDEBAR_GROUP = { schedule: 'schedule', system: 'system' } as const;
export const APP_NAME = import.meta.env.VITE_APP_NAME ?? 'EduCenter';
export const LIST_PARAMS = {
  search: 'q',
  page: 'page',
  pageSize: 'size',
  status: 'status',
} as const;
export const PAGE_SIZES = [10, 25, 50] as const;
export const STATUS_FILTER = { all: '', active: 'active', inactive: 'inactive' } as const;
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'https://educenter2.runasp.net/api';
export const STORAGE_KEYS = {
  auth: 'educenter.auth',
  rememberSession: 'educenter.remember_session',
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
  roles: '/roles',
  employees: '/employees',
  profile: '/profile',
  appointments: '/appointments',
  classrooms: '/classrooms',
  systemManagement: '/system-management',
  contactUs: '/contact-us',
} as const;
export const API_ENDPOINTS = {
  contactUs: {
    getAll: '/v1/ContactUs/GetAll',
    detail: (id: string) => `/v1/ContactUs/GetById/${encodeURIComponent(id)}`,
    delete: '/v1/ContactUs/Delete',
    export: '/v1/ContactUs/Export',
    template: '/v1/ContactUs/Template',
    import: '/v1/ContactUs/ImportExcelFile',
  },
  auth: {
    login: '/Auth/dashboard/login',
    refresh: '/Auth/refresh-token',
    logout: '/Auth/logout',
    forgotPassword: '/Auth/forgot-password',
    verifyResetOtp: '/Auth/verify-reset-otp',
    resetPassword: '/Auth/reset-password',
    profile: '/Auth/me',
    updateProfile: '/Auth/profile',
    changePassword: '/Auth/change-password',
  },
  roles: {
    getAll: '/Roles',
    permissions: '/Roles/permissions',
    detail: (id: string) => `/Roles/permissions/${encodeURIComponent(id)}`,
    create: '/Roles',
    update: (id: string) => `/Roles/${encodeURIComponent(id)}`,
    delete: '/Roles',
    options: '/v1/select-menu/GetRoles',
  },
  employees: {
    getAll: '/v1/SubAdminEmployee',
    detail: (id: string) => `/v1/SubAdminEmployee/${encodeURIComponent(id)}`,
    create: '/v1/SubAdminEmployee',
    update: '/v1/SubAdminEmployee',
    delete: '/v1/SubAdminEmployee',
    toggleStatus: (id: string) => `/v1/SubAdminEmployee/toggle-status/${encodeURIComponent(id)}`,
  },
  classrooms: {
    getAll: '/v1/Classrooms/GetAll',
    getById: (id: string) => `/v1/Classrooms/ShowOneDetails/${encodeURIComponent(id)}`,
    create: '/v1/Classrooms/Create',
    update: '/v1/Classrooms/Update',
    delete: '/v1/Classrooms/Delete',
    toggleStatus: (id: string) => `/v1/Classrooms/ToggleStatus/${encodeURIComponent(id)}`,
  },
  appointments: {
    getAll: '/v1/Appointments/GetAll',
    detail: (id: string) => `/v1/Appointments/ShowOneDetails/${encodeURIComponent(id)}`,
    create: '/v1/Appointments/Create',
    update: '/v1/Appointments/Update',
    delete: '/v1/Appointments/Delete',
    setStatus: (id: string) => `/v1/Appointments/SetStatus/${encodeURIComponent(id)}`,
    teachers: '/v1/Appointments/GetTeachers',
    subjects: '/v1/select-menu/GetSubjects',
    classrooms: '/v1/select-menu/GetClassrooms',
    levels: '/v1/select-menu/GetEducationLevels',
    grades: '/v1/select-menu/GetEducationGrades',
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
  contactUs: ['contact-us'],
  appointments: ['appointments'],
  systemManagement: ['system-management'],
  options: 'options',
  detail: 'detail',
  permissions: 'permissions',
  roles: ['roles'],
  employees: ['employees'],
  auth: ['auth'],
  profile: ['profile'],
  classrooms: ['classrooms'],
  subjects: ['subjects'],
  teachers: ['teachers'],
} as const;
