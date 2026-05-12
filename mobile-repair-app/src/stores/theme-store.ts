import { create } from 'zustand';
import type { ThemeRole } from '../theme/colors';

interface ThemeState {
  role: ThemeRole;
  /** Switches the active theme (customer / technician / tenant). */
  setRole: (role: ThemeRole) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  role: 'customer',
  setRole: (role) => set({ role }),
}));
