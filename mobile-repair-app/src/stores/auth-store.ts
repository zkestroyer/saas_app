/** Auth Store — Enhanced Zustand store with real Supabase session management.
 * Per ADR-004 (Zustand for client state) and ADR-010 (Supabase Auth).
 *
 * Manages the authenticated user, session, loading, and error states.
 * Works in conjunction with auth-service.ts for actual Supabase calls.
 */
import { create } from 'zustand';
import type { User, UserRole } from '../types';

interface AuthState {
  /** The authenticated user's application profile. */
  user: User | null;
  /** Whether the user is currently authenticated. */
  isAuthenticated: boolean;
  /** Whether auth state is being determined (app startup). */
  isLoading: boolean;
  /** Last auth error message for display. */
  error: string | null;

  /** Sets the authenticated user after successful sign-in. */
  setUser: (user: User | null) => void;
  /** Logs the user out and clears all state. */
  logout: () => void;
  /** Sets the loading flag. */
  setLoading: (loading: boolean) => void;
  /** Sets an error message. */
  setError: (error: string | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  setUser: (user) =>
    set({
      user,
      isAuthenticated: user !== null,
      isLoading: false,
      error: null,
    }),

  logout: () =>
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error, isLoading: false }),
}));

/** Convenience selector for current user role. */
export const useUserRole = (): UserRole | null =>
  useAuthStore((s) => s.user?.role ?? null);
