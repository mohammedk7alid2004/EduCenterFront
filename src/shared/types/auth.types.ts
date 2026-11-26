import type { Role } from '@/app/config/permissions';

export interface AuthUser {
  id: string;
  name: string;
  roles: Role[];
  roleName?: string;
  permissions?: string[];
}
