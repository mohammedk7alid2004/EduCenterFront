import { beforeEach, describe, expect, it } from 'vitest';
import { STORAGE_KEYS } from '@/config';
import { useAuthStore } from './auth-store';
const user = { id: 'id', name: 'Admin', roles: ['superadmin'] as const };
describe('authentication persistence', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    useAuthStore.getState().logout();
    localStorage.clear();
    sessionStorage.clear();
  });
  it('keeps unchecked remember-me sessions in session storage', () => {
    useAuthStore
      .getState()
      .setSession('token', 'refresh', { ...user, roles: [...user.roles] }, false);
    expect(localStorage.getItem(STORAGE_KEYS.auth)).toBeNull();
    expect(sessionStorage.getItem(STORAGE_KEYS.auth)).toContain('token');
  });
  it('persists remembered sessions and removes the prior session copy', () => {
    useAuthStore
      .getState()
      .setSession('old', 'old-refresh', { ...user, roles: [...user.roles] }, false);
    useAuthStore
      .getState()
      .setSession('new', 'new-refresh', { ...user, roles: [...user.roles] }, true);
    expect(sessionStorage.getItem(STORAGE_KEYS.auth)).toBeNull();
    expect(localStorage.getItem(STORAGE_KEYS.auth)).toContain('new');
  });
});
