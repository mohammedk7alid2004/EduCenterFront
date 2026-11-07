import { create } from 'zustand'; import { persist } from 'zustand/middleware'; import { STORAGE_KEYS, type Role } from '@/config';
export interface AuthUser { id: string; name: string; roles: Role[]; }
interface AuthState { accessToken: string | null; user: AuthUser | null; setSession: (token: string, user: AuthUser) => void; setAccessToken: (token: string) => void; logout: () => void; }
export const useAuthStore = create<AuthState>()(persist((set) => ({ accessToken: null, user: null, setSession: (accessToken, user) => set({ accessToken, user }), setAccessToken: (accessToken) => set({ accessToken }), logout: () => set({ accessToken: null, user: null }) }), { name: STORAGE_KEYS.auth }));
