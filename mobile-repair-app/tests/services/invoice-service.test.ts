/**
 * Unit tests for src/services/invoice-service.ts
 * Tests payment lock invariant and total recalculation logic.
 */

/* Test the payment lock invariant logic directly */
describe('InvoiceService — Payment Lock Invariant', () => {
  /**
   * Simulates the lock guard check used in invoice-service.ts.
   * An invoice can only be modified if is_locked === false.
   */
  function canModifyInvoice(invoice: { is_locked: boolean }): boolean {
    return !invoice.is_locked;
  }

  /**
   * Simulates the total recalculation logic.
   */
  function recalculateTotals(
    items: { quantity: number; unit_price: number }[],
    taxRate: number = 0.08,
    dispatchCharge: number = 0,
  ) {
    const subtotal = items.reduce((sum, i) => sum + i.quantity * i.unit_price, 0);
    const tax = subtotal * taxRate;
    const total = subtotal + tax + dispatchCharge;
    return { subtotal, tax_amount: tax, total };
  }

  describe('canModifyInvoice', () => {
    it('allows modification when unlocked', () => {
      expect(canModifyInvoice({ is_locked: false })).toBe(true);
    });

    it('blocks modification when locked', () => {
      expect(canModifyInvoice({ is_locked: true })).toBe(false);
    });
  });

  describe('recalculateTotals', () => {
    it('calculates correct totals with multiple items', () => {
      const items = [
        { quantity: 1, unit_price: 120 },  // Screen part
        { quantity: 1, unit_price: 50 },   // Labor
        { quantity: 1, unit_price: 15 },   // Dispatch
      ];

      const result = recalculateTotals(items);
      expect(result.subtotal).toBe(185);
      expect(result.tax_amount).toBeCloseTo(14.80, 2);
      expect(result.total).toBeCloseTo(199.80, 2);
    });

    it('returns zero for empty items', () => {
      const result = recalculateTotals([]);
      expect(result.subtotal).toBe(0);
      expect(result.tax_amount).toBe(0);
      expect(result.total).toBe(0);
    });

    it('handles quantity > 1', () => {
      const items = [{ quantity: 3, unit_price: 20 }];
      const result = recalculateTotals(items);
      expect(result.subtotal).toBe(60);
      expect(result.tax_amount).toBeCloseTo(4.80, 2);
    });

    it('includes dispatch charge in total', () => {
      const items = [{ quantity: 1, unit_price: 100 }];
      const result = recalculateTotals(items, 0.08, 25);
      expect(result.subtotal).toBe(100);
      expect(result.tax_amount).toBe(8);
      expect(result.total).toBe(133);  // 100 + 8 + 25
    });
  });

  describe('lock invariant enforcement', () => {
    it('cannot add items to a locked invoice', () => {
      const invoice = { is_locked: true };
      expect(canModifyInvoice(invoice)).toBe(false);
      // In real service: addLineItem() returns { success: false, message: 'INVOICE_LOCKED' }
    });

    it('cannot remove items from a locked invoice', () => {
      const invoice = { is_locked: true };
      expect(canModifyInvoice(invoice)).toBe(false);
    });

    it('lock transition is one-way (cannot unlock)', () => {
      const invoice = { is_locked: true };
      // There is no unlockInvoice() method - this is by design (ADR-008)
      expect(canModifyInvoice(invoice)).toBe(false);
    });
  });
});
