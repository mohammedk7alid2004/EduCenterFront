import { canUsePermission } from '@/config';
import { useAuthStore } from './auth-store';
export function usePermission(): (permission: string) => boolean {
  const user = useAuthStore((state) => state.user);
  return (permission) => canUsePermission(user, permission);
}
