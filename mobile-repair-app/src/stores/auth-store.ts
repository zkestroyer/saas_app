import { create } from 'zustand';
import type { User, UserRole } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  /** Sets the authenticated user. */
  setUser: (user: User | null) => void;
  /** Logs the user out and clears state. */
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user) =>
    set({ user, isAuthenticated: user !== null, isLoading: false }),

  logout: () =>
    set({ user: null, isAuthenticated: false, isLoading: false }),

  setLoading: (isLoading) => set({ isLoading }),
}));

/** Convenience selector for current user role. */
export const useUserRole = (): UserRole | null =>
  useAuthStore((s) => s.user?.role ?? null);
