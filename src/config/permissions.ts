export const ROLES = { admin: 'admin', teacher: 'teacher', student: 'student' } as const;
export type Role = (typeof ROLES)[keyof typeof ROLES];
export const ROLE_PERMISSIONS: Record<Role, readonly string[]> = { [ROLES.admin]: ['*'], [ROLES.teacher]: ['courses:read'], [ROLES.student]: ['profile:read'] };
export function hasPermission(roles: readonly Role[], permission: string): boolean { return roles.some((role) => ROLE_PERMISSIONS[role].includes('*') || ROLE_PERMISSIONS[role].includes(permission)); }
