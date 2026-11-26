import type { PermissionDto } from '../types';
export function groupPermissions(
  permissions: readonly PermissionDto[],
): Map<string, PermissionDto[]> {
  const groups = new Map<string, PermissionDto[]>();
  for (const permission of permissions) {
    const separator = permission.permissionName.lastIndexOf('.');
    const group =
      separator < 0 ? permission.permissionName : permission.permissionName.slice(0, separator);
    groups.set(group, [...(groups.get(group) ?? []), permission]);
  }
  return groups;
}
export function humanizePermission(value: string): string {
  return value.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/[_.]/g, ' ');
}
