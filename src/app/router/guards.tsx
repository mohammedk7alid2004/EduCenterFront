import type { PropsWithChildren } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import {
  ROUTES,
  canAccessAnyPermission,
  canUsePermission,
  getDefaultAuthorizedRoute,
  type Role,
} from '@/config';
import { useAuthStore } from '@/infrastructure/auth';
export function ProtectedRoute({
  children,
  roles,
  permission,
  anyPermissions,
}: PropsWithChildren<{
  roles?: Role[];
  permission?: string;
  anyPermissions?: readonly string[];
}>): JSX.Element {
  const user = useAuthStore((state) => state.user);
  const location = useLocation();
  if (!user) return <Navigate replace to={ROUTES.login} state={{ from: location }} />;
  if (
    (roles && !roles.some((role) => user.roles.includes(role))) ||
    (permission && !canUsePermission(user, permission)) ||
    (anyPermissions && !canAccessAnyPermission(user, anyPermissions))
  )
    return <Navigate replace to={getDefaultAuthorizedRoute(user)} />;
  return <>{children}</>;
}
export function GuestRoute({ children }: PropsWithChildren): JSX.Element {
  const user = useAuthStore((state) => state.user);
  return user ? <Navigate replace to={getDefaultAuthorizedRoute(user)} /> : <>{children}</>;
}
