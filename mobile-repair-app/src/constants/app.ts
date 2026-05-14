/** App-wide constants for the Revivix application.
 * Centralised to avoid magic numbers and strings throughout the codebase.
 */

/** Application metadata. */
export const APP = {
  NAME: 'Revivix',
  TAGLINE: 'Premium Mobile Repair Network',
  VERSION: '1.0.0',
  BUILD: 1,
  SUPPORT_EMAIL: 'support@revivix.app',
  WEBSITE: 'https://revivix.app',
  BUNDLE_ID: {
    IOS: 'com.revivix.app',
    ANDROID: 'com.revivix.app',
  },
} as const;

/** Tax & financial constants. */
export const FINANCE = {
  TAX_RATE: 0.08,
  CURRENCY: 'USD',
  CURRENCY_SYMBOL: '$',
} as const;

/** API & network configuration. */
export const API = {
  /** TanStack Query stale time (5 minutes). */
  STALE_TIME: 1000 * 60 * 5,
  /** TanStack Query retry count. */
  RETRY_COUNT: 2,
  /** Request timeout in milliseconds. */
  TIMEOUT: 10_000,
} as const;

/** UI timing constants (milliseconds). */
export const ANIMATION = {
  SPLASH_DURATION: 2500,
  TOAST_DURATION: 3000,
  DEBOUNCE_DELAY: 300,
  TRANSITION: 250,
} as const;

/** Pagination defaults. */
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

/** Notification channels (for Expo Notifications). */
export const NOTIFICATION_CHANNELS = {
  JOB_UPDATES: 'job-updates',
  INVOICES: 'invoices',
  PROMOTIONS: 'promotions',
} as const;
