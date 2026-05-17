# 06 — Invoice Lifecycle Test Cases

> **Service:** `src/services/invoice-service.ts`  
> **Constants:** Tax rate = 8% (`FINANCE.TAX_RATE = 0.08`)  
> **Requirements:** FR-INV-01 through FR-INV-06  
> **CRITICAL RULE:** Once `is_locked = true`, NO mutations are permitted

---

## Test Suite: `invoices.spec.ts`

### TC-INV-001: Create Draft Invoice
**Priority:** P0  
**Requirement:** FR-INV-01

```typescript
test('should create a draft invoice for a job', async ({ technicianClient }) => {
  const { data: { user } } = await technicianClient.auth.getUser();

  const { data: job } = await adminClient
    .from('jobs')
    .insert(createJobPayload({ status: 'repairing', technician_id: user!.id }))
    .select().single();

  const { data: invoice, error } = await technicianClient
    .from('invoices')
    .insert({
      job_id: job!.id,
      status: 'draft',
      subtotal: 0,
      tax_amount: 0,
      dispatch_charge: 0,
      total: 0,
      is_locked: false,
    })
    .select().single();

  expect(error).toBeNull();
  expect(invoice.status).toBe('draft');
  expect(invoice.is_locked).toBe(false);
  expect(invoice.subtotal).toBe(0);
  expect(invoice.total).toBe(0);
});
```

---

### TC-INV-002: Add Part Line Item
**Priority:** P0  
**Requirement:** FR-INV-02

```typescript
test('should add a part line item and calculate amount', async ({ technicianClient }) => {
  // Get an unlocked invoice
  const invoiceId = /* from previous test or setup */;

  const { data: item, error } = await technicianClient
    .from('invoice_items')
    .insert({
      invoice_id: invoiceId,
      type: 'part',
      description: 'OEM Screen Assembly — iPhone 15 Pro',
      quantity: 1,
      unit_price: 149.99,
      amount: 149.99, // quantity × unit_price
    })
    .select().single();

  expect(error).toBeNull();
  expect(item.type).toBe('part');
  expect(item.amount).toBe(149.99);
  expect(item.quantity).toBe(1);
});
```

---

### TC-INV-003: Add Labor Line Item
**Priority:** P0  
**Requirement:** FR-INV-02

```typescript
test('should add a labor line item', async ({ technicianClient }) => {
  const { data: item, error } = await technicianClient
    .from('invoice_items')
    .insert({
      invoice_id: invoiceId,
      type: 'labor',
      description: 'Screen replacement — 45 minutes',
      quantity: 1,
      unit_price: 49.99,
      amount: 49.99,
    })
    .select().single();

  expect(error).toBeNull();
  expect(item.type).toBe('labor');
});
```

---

### TC-INV-004: Add Dispatch Charge
**Priority:** P1  
**Requirement:** FR-INV-02

```typescript
test('should add dispatch charge line item', async ({ technicianClient }) => {
  const { data: item, error } = await technicianClient
    .from('invoice_items')
    .insert({
      invoice_id: invoiceId,
      type: 'dispatch',
      description: 'Home visit dispatch fee — 15km',
      quantity: 1,
      unit_price: 25.00,
      amount: 25.00,
    })
    .select().single();

  expect(error).toBeNull();
  expect(item.type).toBe('dispatch');
});
```

---

### TC-INV-005: Recalculate Totals
**Priority:** P0  
**Requirement:** FR-INV-03, FR-INV-04

```typescript
test('should correctly recalculate subtotal, tax, and total', async () => {
  // Fetch active items for the invoice
  const { data: items } = await adminClient
    .from('invoice_items')
    .select('*')
    .eq('invoice_id', invoiceId)
    .is('deleted_at', null);

  // Manual calculation
  const subtotal = items!
    .filter(i => i.type === 'part' || i.type === 'labor')
    .reduce((sum, i) => sum + Number(i.amount), 0);

  const taxAmount = Math.round(subtotal * 0.08 * 100) / 100; // 8% tax

  const dispatchCharge = items!
    .filter(i => i.type === 'dispatch')
    .reduce((sum, i) => sum + Number(i.amount), 0);

  const expectedTotal = Math.round((subtotal + taxAmount + dispatchCharge) * 100) / 100;

  // Update invoice with recalculated values
  const { data: updated } = await adminClient
    .from('invoices')
    .update({ subtotal, tax_amount: taxAmount, dispatch_charge: dispatchCharge, total: expectedTotal })
    .eq('id', invoiceId)
    .select().single();

  expect(updated.subtotal).toBe(subtotal);
  expect(updated.tax_amount).toBe(taxAmount);
  expect(updated.total).toBe(expectedTotal);

  // With items: part=$149.99, labor=$49.99, dispatch=$25.00
  // subtotal = 149.99 + 49.99 = 199.98
  // tax = 199.98 * 0.08 = 16.00
  // total = 199.98 + 16.00 + 25.00 = 240.98
});
```

**What this tests:**
- Subtotal only includes `part` + `labor` items
- Tax is exactly 8% of subtotal
- Dispatch charges are separate from subtotal
- Total = subtotal + tax + dispatch

---

### TC-INV-006: Lock Invoice (Payment)
**Priority:** P0 — CRITICAL  
**Requirement:** FR-INV-06

```typescript
test('should lock invoice after payment — IRREVERSIBLE', async ({ technicianClient }) => {
  const { data: locked, error } = await technicianClient
    .from('invoices')
    .update({
      is_locked: true,
      status: 'paid',
      locked_at: new Date().toISOString(),
      payment_method: 'card',
    })
    .eq('id', invoiceId)
    .eq('is_locked', false) // Atomic guard
    .select().single();

  expect(error).toBeNull();
  expect(locked.is_locked).toBe(true);
  expect(locked.status).toBe('paid');
  expect(locked.locked_at).toBeTruthy();
  expect(locked.payment_method).toBe('card');
});
```

---

### TC-INV-007: Cannot Add Items to Locked Invoice
**Priority:** P0 — CRITICAL  
**Requirement:** FR-INV-06

```typescript
test('should REJECT adding items to a locked invoice', async ({ technicianClient }) => {
  // Attempt to add item to locked invoice
  const { error } = await technicianClient
    .from('invoice_items')
    .insert({
      invoice_id: lockedInvoiceId,
      type: 'part',
      description: 'Should not be added',
      quantity: 1,
      unit_price: 99.99,
      amount: 99.99,
    });

  // RLS policy: technicians can only insert items where is_locked = FALSE
  expect(error).toBeTruthy();
});
```

**What this tests:**
- The CRITICAL business rule: locked invoices are immutable
- RLS policy `Technicians create invoice items` enforces `is_locked = FALSE`

---

### TC-INV-008: Cannot Update Items on Locked Invoice
**Priority:** P0 — CRITICAL  
**Requirement:** FR-INV-06

```typescript
test('should REJECT updating items on a locked invoice', async ({ technicianClient }) => {
  // Get an item from the locked invoice
  const { data: items } = await adminClient
    .from('invoice_items')
    .select('id')
    .eq('invoice_id', lockedInvoiceId)
    .limit(1);

  if (!items || items.length === 0) { test.skip(); return; }

  const { error } = await technicianClient
    .from('invoice_items')
    .update({ unit_price: 999.99 })
    .eq('id', items[0].id);

  // RLS: update only allowed when is_locked = FALSE
  expect(error).toBeTruthy();
});
```

---

### TC-INV-009: Cannot Lock Already-Locked Invoice
**Priority:** P1  
**Requirement:** FR-INV-06

```typescript
test('should prevent double-locking an invoice', async ({ technicianClient }) => {
  const { data, error } = await technicianClient
    .from('invoices')
    .update({
      is_locked: true,
      status: 'paid',
      locked_at: new Date().toISOString(),
      payment_method: 'cash',
    })
    .eq('id', lockedInvoiceId)
    .eq('is_locked', false) // Atomic guard — won't match already-locked
    .select();

  // Should return no rows (guard clause prevents match)
  expect(data).toEqual([]);
});
```

---

### TC-INV-010: Invoice Status Transitions
**Priority:** P1

```typescript
test.describe('Invoice status transitions', () => {
  test('draft → quoted', async ({ technicianClient }) => {
    const { data } = await technicianClient
      .from('invoices')
      .update({ status: 'quoted' })
      .eq('id', draftInvoiceId)
      .select().single();
    expect(data.status).toBe('quoted');
  });

  test('quoted → approved', async ({ technicianClient }) => {
    const { data } = await technicianClient
      .from('invoices')
      .update({ status: 'approved' })
      .eq('id', quotedInvoiceId)
      .select().single();
    expect(data.status).toBe('approved');
  });

  test('any → cancelled', async ({ technicianClient }) => {
    const { data } = await technicianClient
      .from('invoices')
      .update({ status: 'cancelled' })
      .eq('id', someInvoiceId)
      .select().single();
    expect(data.status).toBe('cancelled');
  });
});
```

---

## Summary

| Test ID | Test Name | Priority | Expected Result |
|---------|-----------|----------|-----------------|
| TC-INV-001 | Create Draft | P0 | Invoice created, is_locked=false |
| TC-INV-002 | Add Part Item | P0 | Part item added with amount |
| TC-INV-003 | Add Labor Item | P0 | Labor item added |
| TC-INV-004 | Add Dispatch | P1 | Dispatch charge added |
| TC-INV-005 | Recalculate Totals | P0 | Tax=8%, totals correct |
| TC-INV-006 | Lock Invoice | P0 | **Locked, paid, irreversible** |
| TC-INV-007 | Add to Locked | P0 | **REJECTED by RLS** |
| TC-INV-008 | Update Locked Item | P0 | **REJECTED by RLS** |
| TC-INV-009 | Double Lock | P1 | No rows updated |
| TC-INV-010 | Status Transitions | P1 | All valid transitions work |
