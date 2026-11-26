import type { AuditFields } from '@/shared/types';
export interface RoleDto extends AuditFields {
  id: string;
  name: string;
}
export interface PermissionDto {
  permissionId: string;
  permissionName: string;
}
export interface RoleDetail {
  roleId: string;
  roleName: string;
  permissions: PermissionDto[];
}
export interface RoleValues {
  name: string;
  permissionIds: string[];
}
export interface CreateRoleResult extends RoleDto {
  permissions: PermissionDto[];
}
