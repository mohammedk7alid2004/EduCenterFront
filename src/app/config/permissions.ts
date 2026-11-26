export const ROLES = {
  admin: 'admin',
  superadmin: 'superadmin',
  staff: 'staff',
  customer: 'customer',
  teacher: 'teacher',
  student: 'student',
} as const;
export type Role = (typeof ROLES)[keyof typeof ROLES];
export const ROLE_PERMISSIONS: Record<Role, readonly string[]> = {
  [ROLES.admin]: ['*'],
  [ROLES.superadmin]: ['*'],
  [ROLES.staff]: [],
  [ROLES.customer]: [],
  [ROLES.teacher]: ['courses:read'],
  [ROLES.student]: ['profile:read'],
};
export function hasPermission(roles: readonly Role[], permission: string): boolean {
  return roles.some(
    (role) => ROLE_PERMISSIONS[role].includes('*') || ROLE_PERMISSIONS[role].includes(permission),
  );
}

export const PERMISSIONS = {
  dashboard: {
    read: 'Statistics.GetDashboard',
  },
  students: {
    read: 'Students.GetAll',
    detail: 'Students.GetById',
    create: 'Students.Create',
    update: 'Students.Update',
    delete: 'Students.Delete',
    toggleStatus: 'Students.ToggleStatus',
    template: 'Students.GetTemplateExcelFile',
    import: 'Students.ImportExcelFile',
  },
  teachers: {
    read: 'Teachers.GetAll',
  },
  contactUs: {
    read: 'ContactUs.ViewAll',
    detail: 'ContactUs.ShowOne',
    delete: 'ContactUs.Delete',
    export: 'ContactUs.ExportExcelFile',
    template: 'ContactUs.GetTemplateExcelFile',
    import: 'ContactUs.ImportExcelFile',
    sendEmail: 'ContactUs.SendEmail',
  },
  appointments: {
    read: 'Appointments.GetAll',
    detail: 'Appointments.GetById',
    create: 'Appointments.Create',
    update: 'Appointments.Update',
    delete: 'Appointments.Delete',
    toggleStatus: 'Appointments.ToggleStatus',
    export: 'Appointments.ExportData',
  },
  groups: {
    read: 'Appointments.GetAll',
    detail: 'Appointments.GetById',
    create: 'Appointments.Create',
    update: 'Appointments.Update',
    delete: 'Appointments.Delete',
    connectStudents: 'Appointments.Update',
  },
  attendance: {
    read: 'Attendance.GetAll',
    detail: 'Attendance.GetById',
    record: 'Attendance.Record',
  },
  classrooms: {
    read: 'Classrooms.GetAll',
    export: 'Classrooms.ExportData',
    create: 'Classrooms.Create',
    update: 'Classrooms.Update',
    delete: 'Classrooms.Delete',
    toggleStatus: 'Classrooms.ToggleStatus',
  },
  subjects: {
    read: 'Subjects.GetAll',
    export: 'Subjects.ExportData',
  },
  roles: {
    read: 'Roles.Read',
    create: 'Roles.Create',
    update: 'Roles.Update',
    delete: 'Roles.Delete',
  },
  employees: {
    read: 'SubAdminEmployee.GetAll',
    detail: 'SubAdminEmployee.GetById',
    create: 'SubAdminEmployee.Create',
    update: 'SubAdminEmployee.Update',
    delete: 'SubAdminEmployee.Delete',
    toggleStatus: 'SubAdminEmployee.ToggleStatus',
  },
  systemManagement: {
    privacy: 'PrivacyPolicy.View',
    registration: 'StudentRegistration.View',
    terms: 'TermsAndConditions.View',
    social: 'SocialMediaLinks.View',
    faq: 'FAQ.ViewAll',
    payment: 'PaymentPolicy.View',
    help: 'Help.View',
    center: 'CenterSettings.View',
  },
  notifications: {
    read: 'Notifications.GetAll',
    detail: 'Notifications.GetById',
    create: 'Notifications.Create',
    update: 'Notifications.Update',
    delete: 'Notifications.Delete',
    resend: 'Notifications.Resend',
  },
} as const;
export const RESERVED_ROLE_NAMES = ['superadmin', 'customer', 'user'] as const;
export function isReservedRole(name: string): boolean {
  return RESERVED_ROLE_NAMES.some((value) => value === name.trim().toLowerCase());
}
export function canUsePermission(
  user: { roles: readonly Role[]; permissions?: readonly string[] } | null,
  permission: string,
): boolean {
  return Boolean(
    user &&
    (user.roles.includes(ROLES.superadmin) ||
      user.permissions?.includes('*') ||
      user.permissions?.includes(permission)),
  );
}
import { ROUTES } from '@/shared/constants';

const SYSTEM_MANAGEMENT_READ_PERMISSIONS = Object.values(PERMISSIONS.systemManagement);

const DEFAULT_ROUTE_ACCESS = [
  { route: ROUTES.dashboard, permissions: [PERMISSIONS.dashboard.read] },
  { route: ROUTES.appointments, permissions: [PERMISSIONS.appointments.read] },
  { route: ROUTES.teachers, permissions: [PERMISSIONS.teachers.read] },
  { route: ROUTES.groups, permissions: [PERMISSIONS.groups.read] },
  { route: ROUTES.subjects, permissions: [PERMISSIONS.subjects.read] },
  { route: ROUTES.classrooms, permissions: [PERMISSIONS.classrooms.read] },
  { route: ROUTES.students, permissions: [PERMISSIONS.students.read] },
  { route: ROUTES.attendance, permissions: [PERMISSIONS.attendance.read] },
  { route: ROUTES.roles, permissions: [PERMISSIONS.roles.read] },
  { route: ROUTES.employees, permissions: [PERMISSIONS.employees.read] },
  { route: ROUTES.contactUs, permissions: [PERMISSIONS.contactUs.read] },
  { route: ROUTES.systemManagement, permissions: SYSTEM_MANAGEMENT_READ_PERMISSIONS },
] as const;

export function getDefaultAuthorizedRoute(
  user: { roles: readonly Role[]; permissions?: readonly string[] } | null,
): string {
  return (
    DEFAULT_ROUTE_ACCESS.find((entry) =>
      entry.permissions.some((permission) => canUsePermission(user, permission)),
    )?.route ?? ROUTES.profile
  );
}

export function canAccessAnyPermission(
  user: { roles: readonly Role[]; permissions?: readonly string[] } | null,
  permissions: readonly string[],
): boolean {
  return permissions.some((permission) => canUsePermission(user, permission));
}
