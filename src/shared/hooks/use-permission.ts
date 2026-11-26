import { canUsePermission } from '@/app/config';
import { useAuthStore } from './use-auth-store';
export function usePermission(): (permission: string) => boolean {
  const user = useAuthStore((state) => state.user);
  return (permission) => canUsePermission(user, permission);
}
