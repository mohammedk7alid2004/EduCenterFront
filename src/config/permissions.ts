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
  classrooms: {
    create: 'Classrooms.Create',
    update: 'Classrooms.Update',
    delete: 'Classrooms.Delete',
    toggleStatus: 'Classrooms.ToggleStatus',
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
