/**
 * Unit tests for src/utils/formatters.ts
 */
import {
  formatCurrency,
  formatDate,
  formatRelativeTime,
  formatPhone,
  truncate,
  humanize,
  formatJobId,
} from '../../src/utils/formatters';

describe('formatters', () => {
  describe('formatCurrency', () => {
    it('formats numbers as USD currency', () => {
      expect(formatCurrency(1234.5)).toBe('$1,234.50');
      expect(formatCurrency(0)).toBe('$0.00');
      expect(formatCurrency(99.999)).toBe('$100.00');
    });
  });

  describe('formatDate', () => {
    it('formats ISO date strings', () => {
      const result = formatDate('2026-05-14T10:00:00Z');
      expect(result).toContain('May');
      expect(result).toContain('2026');
    });
  });

  describe('formatPhone', () => {
    it('formats 10-digit numbers', () => {
      expect(formatPhone('2345678901')).toBe('(234) 567-8901');
    });

    it('returns N/A for null/undefined', () => {
      expect(formatPhone(null)).toBe('N/A');
      expect(formatPhone(undefined)).toBe('N/A');
    });
  });

  describe('truncate', () => {
    it('truncates long strings', () => {
      expect(truncate('Hello World', 5)).toBe('Hell…');
    });

    it('returns short strings as-is', () => {
      expect(truncate('Hi', 10)).toBe('Hi');
    });
  });

  describe('humanize', () => {
    it('replaces underscores and capitalises', () => {
      expect(humanize('water_damage')).toBe('Water damage');
      expect(humanize('screen')).toBe('Screen');
    });
  });

  describe('formatJobId', () => {
    it('returns first 8 chars in uppercase', () => {
      expect(formatJobId('abcdefgh-1234-5678')).toBe('ABCDEFGH');
    });
  });
});
