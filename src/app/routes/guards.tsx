import type { PropsWithChildren } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { ROUTES, canUsePermission, type Role } from '@/config';
import { useAuthStore } from '@/core/auth';
export function ProtectedRoute({
  children,
  roles,
  permission,
}: PropsWithChildren<{ roles?: Role[]; permission?: string }>): JSX.Element {
  const user = useAuthStore((state) => state.user);
  const location = useLocation();
  if (!user) return <Navigate replace to={ROUTES.login} state={{ from: location }} />;
  if (
    (roles && !roles.some((role) => user.roles.includes(role))) ||
    (permission && !canUsePermission(user, permission))
  )
    return <Navigate replace to={ROUTES.forbidden} />;
  return <>{children}</>;
}
export function GuestRoute({ children }: PropsWithChildren): JSX.Element {
  const user = useAuthStore((state) => state.user);
  return user ? <Navigate replace to={ROUTES.dashboard} /> : <>{children}</>;
}
