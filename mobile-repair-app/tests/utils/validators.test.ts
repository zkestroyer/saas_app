/**
 * Unit tests for src/utils/validators.ts
 */
import {
  isValidEmail,
  isValidPassword,
  isValidPhone,
  isNotEmpty,
  validateSignUp,
  validateLogin,
} from '../../src/utils/validators';

describe('validators', () => {
  describe('isValidEmail', () => {
    it('accepts valid emails', () => {
      expect(isValidEmail('user@example.com')).toBe(true);
      expect(isValidEmail('name@domain.co')).toBe(true);
      expect(isValidEmail('test.user@company.org')).toBe(true);
    });

    it('rejects invalid emails', () => {
      expect(isValidEmail('')).toBe(false);
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('no@domain')).toBe(false);
      expect(isValidEmail('@missing.com')).toBe(false);
    });
  });

  describe('isValidPassword', () => {
    it('accepts passwords with 6+ characters', () => {
      expect(isValidPassword('123456')).toBe(true);
      expect(isValidPassword('strongPassword123')).toBe(true);
    });

    it('rejects passwords with fewer than 6 characters', () => {
      expect(isValidPassword('')).toBe(false);
      expect(isValidPassword('12345')).toBe(false);
    });
  });

  describe('isValidPhone', () => {
    it('accepts valid phone numbers with 10+ digits', () => {
      expect(isValidPhone('1234567890')).toBe(true);
      expect(isValidPhone('+1 (234) 567-8901')).toBe(true);
    });

    it('rejects short phone numbers', () => {
      expect(isValidPhone('12345')).toBe(false);
    });
  });

  describe('isNotEmpty', () => {
    it('returns true for non-empty strings', () => {
      expect(isNotEmpty('hello')).toBe(true);
    });

    it('returns false for empty/whitespace strings', () => {
      expect(isNotEmpty('')).toBe(false);
      expect(isNotEmpty('   ')).toBe(false);
    });
  });

  describe('validateSignUp', () => {
    it('returns null for valid input', () => {
      expect(validateSignUp('John', 'john@test.com', '123456')).toBeNull();
    });

    it('returns error for missing name', () => {
      expect(validateSignUp('', 'john@test.com', '123456')).toBe('Name is required');
    });

    it('returns error for invalid email', () => {
      expect(validateSignUp('John', 'invalid', '123456')).toBe('Please enter a valid email address');
    });

    it('returns error for short password', () => {
      expect(validateSignUp('John', 'john@test.com', '123')).toBe('Password must be at least 6 characters');
    });
  });

  describe('validateLogin', () => {
    it('returns null for valid input', () => {
      expect(validateLogin('john@test.com', 'password')).toBeNull();
    });

    it('returns error for invalid email', () => {
      expect(validateLogin('bad', 'password')).toBe('Please enter a valid email address');
    });

    it('returns error for empty password', () => {
      expect(validateLogin('john@test.com', '')).toBe('Password is required');
    });
  });
});
