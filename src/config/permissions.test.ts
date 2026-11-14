import { describe, expect, it } from 'vitest';
import { canUsePermission, PERMISSIONS, ROLES } from './permissions';

describe('backend permission grants', () => {
  it('grants only permissions returned for an administrative employee', () => {
    const user = { roles: [ROLES.staff], permissions: [PERMISSIONS.roles.read] };
    expect(canUsePermission(user, PERMISSIONS.roles.read)).toBe(true);
    expect(canUsePermission(user, PERMISSIONS.roles.update)).toBe(false);
    expect(canUsePermission({ ...user, permissions: [] }, PERMISSIONS.roles.read)).toBe(false);
  });
  it('does not infer every permission from a generic admin role', () => {
    expect(
      canUsePermission({ roles: [ROLES.admin], permissions: [] }, PERMISSIONS.roles.delete),
    ).toBe(false);
    expect(
      canUsePermission({ roles: [ROLES.superadmin], permissions: [] }, PERMISSIONS.roles.delete),
    ).toBe(true);
  });
});
