/** Design tokens for the RepairPro dual-theme system.
 * Customer ("Clean Tech") uses cyan/blue accents.
 * Technician ("Industrial Pro") uses amber/orange accents.
 */

export const Colors = {
  /* ── Shared Base ── */
  background: '#0A0E27',
  backgroundSecondary: '#111631',
  surface: '#1A2234',
  surfaceElevated: '#243044',
  surfaceGlass: 'rgba(26, 34, 52, 0.65)',

  textPrimary: '#F4F6FA',
  textSecondary: '#9BA3AE',
  textMuted: '#5C6678',

  border: 'rgba(255, 255, 255, 0.08)',
  borderLight: 'rgba(255, 255, 255, 0.15)',

  /* ── Semantic ── */
  success: '#2FB344',
  successLight: 'rgba(47, 179, 68, 0.15)',
  warning: '#F59E0B',
  warningLight: 'rgba(245, 158, 11, 0.15)',
  danger: '#D63939',
  dangerLight: 'rgba(214, 57, 57, 0.15)',
  info: '#4299E1',
  infoLight: 'rgba(66, 153, 225, 0.15)',

  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',

  /* ── Customer Theme ("Clean Tech") ── */
  customer: {
    primary: '#206BC4',
    primaryLight: '#4A8EEC',
    primaryDark: '#1A559D',
    accent: '#38BDF8',
    accentGlow: 'rgba(56, 189, 248, 0.3)',
    gradient: ['#206BC4', '#38BDF8'] as const,
    surface: 'rgba(32, 107, 196, 0.08)',
    surfaceActive: 'rgba(32, 107, 196, 0.15)',
  },

  /* ── Technician Theme ("Industrial Pro") ── */
  technician: {
    primary: '#F59E0B',
    primaryLight: '#FBBF24',
    primaryDark: '#D97706',
    accent: '#FB923C',
    accentGlow: 'rgba(251, 146, 60, 0.3)',
    gradient: ['#F59E0B', '#FB923C'] as const,
    surface: 'rgba(245, 158, 11, 0.08)',
    surfaceActive: 'rgba(245, 158, 11, 0.15)',
  },

  /* ── Tenant Theme ── */
  tenant: {
    primary: '#8B5CF6',
    primaryLight: '#A78BFA',
    primaryDark: '#7C3AED',
    accent: '#C084FC',
    accentGlow: 'rgba(192, 132, 252, 0.3)',
    gradient: ['#8B5CF6', '#C084FC'] as const,
    surface: 'rgba(139, 92, 246, 0.08)',
    surfaceActive: 'rgba(139, 92, 246, 0.15)',
  },
} as const;

export type ThemeRole = 'customer' | 'technician' | 'tenant';

/** Returns the role-specific color set. */
export const getRoleColors = (role: ThemeRole) => Colors[role];
