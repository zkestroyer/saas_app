/** Formatting utilities for the Revivix app.
 * Centralises all display formatting to ensure consistency across screens.
 */

/**
 * Formats a number as USD currency.
 * @example formatCurrency(1234.5) → "$1,234.50"
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Formats a date string into a human-readable short format.
 * @example formatDate('2026-05-14T10:00:00Z') → "May 14, 2026"
 */
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Formats a date string to relative time (e.g. "2 hours ago").
 */
export function formatRelativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60_000);
  const diffHr = Math.floor(diffMs / 3_600_000);
  const diffDay = Math.floor(diffMs / 86_400_000);

  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return formatDate(dateStr);
}

/**
 * Formats a phone number for display.
 * @example formatPhone('+12345678901') → "+1 (234) 567-8901"
 */
export function formatPhone(phone: string | null | undefined): string {
  if (!phone) return 'N/A';
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 11) {
    return `+${digits[0]} (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return phone; // Return as-is if not a standard format
}

/**
 * Truncates a string to a maximum length with ellipsis.
 */
export function truncate(text: string, maxLength: number = 50): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 1) + '…';
}

/**
 * Capitalises the first letter and replaces underscores with spaces.
 * @example humanize('water_damage') → "Water damage"
 */
export function humanize(text: string): string {
  const replaced = text.replace(/_/g, ' ');
  return replaced.charAt(0).toUpperCase() + replaced.slice(1);
}

/**
 * Formats a job ID for display (first 8 chars, uppercase).
 */
export function formatJobId(id: string): string {
  return id.slice(0, 8).toUpperCase();
}
