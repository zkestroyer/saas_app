/** Input validation utilities for the Revivix app.
 * Used across auth forms, booking forms, and profile editing.
 */

/** Validates an email address format. */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/** Validates password meets minimum requirements (≥6 chars). */
export function isValidPassword(password: string): boolean {
  return password.length >= 6;
}

/** Validates a phone number (at least 10 digits). */
export function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10;
}

/** Validates a non-empty string after trimming. */
export function isNotEmpty(value: string): boolean {
  return value.trim().length > 0;
}

/** Returns the first validation error message, or null if valid. */
export function validateSignUp(
  name: string,
  email: string,
  password: string,
): string | null {
  if (!isNotEmpty(name)) return 'Name is required';
  if (!isValidEmail(email)) return 'Please enter a valid email address';
  if (!isValidPassword(password)) return 'Password must be at least 6 characters';
  return null;
}

/** Returns the first validation error for login, or null if valid. */
export function validateLogin(email: string, password: string): string | null {
  if (!isValidEmail(email)) return 'Please enter a valid email address';
  if (!isNotEmpty(password)) return 'Password is required';
  return null;
}
