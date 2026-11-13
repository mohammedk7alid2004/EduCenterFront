import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { STORAGE_KEYS, type Role } from '@/config';

export interface AuthUser {
  id: string;
  name: string;
  roles: Role[];
  roleName?: string;
  permissions?: string[];
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  setSession: (
    accessToken: string,
    refreshToken: string,
    user: AuthUser,
    rememberMe?: boolean,
  ) => void;
  setAccessToken: (accessToken: string) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      setSession: (accessToken, refreshToken, user, rememberMe = true) => {
        sessionStorage.setItem(STORAGE_KEYS.rememberSession, String(rememberMe));
        localStorage.removeItem(STORAGE_KEYS.auth);
        sessionStorage.removeItem(STORAGE_KEYS.auth);
        set({ accessToken, refreshToken, user });
      },
      setAccessToken: (accessToken) => set({ accessToken }),
      setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),
      logout: () => set({ accessToken: null, refreshToken: null, user: null }),
    }),
    {
      name: STORAGE_KEYS.auth,
      storage: createJSONStorage(() => ({
        getItem: (name) => localStorage.getItem(name) ?? sessionStorage.getItem(name),
        setItem: (name, value) => {
          const storage =
            sessionStorage.getItem(STORAGE_KEYS.rememberSession) === 'false'
              ? sessionStorage
              : localStorage;
          storage.setItem(name, value);
        },
        removeItem: (name) => {
          localStorage.removeItem(name);
          sessionStorage.removeItem(name);
        },
      })),
    },
  ),
);
