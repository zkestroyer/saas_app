# 04 — Technician Role Test Cases

> **Screens:** `app/(technician)/index.tsx`, `job/[id].tsx`, `invoice/[id].tsx`, `profile.tsx`  
> **Services:** `job-service.ts`, `invoice-service.ts`, `receiving-note-service.ts`  
> **Requirements:** FR-JOB-03, FR-REPAIR-01 through FR-REPAIR-04, FR-INV-01 through FR-INV-06

---

## Test Suite: `technician-jobs.spec.ts`

### TC-TECH-001: Technician Reads Assigned Jobs
**Priority:** P0  
**Requirement:** FR-JOB-03

```typescript
test('technician should see only assigned jobs', async ({ technicianClient }) => {
  const { data: { user } } = await technicianClient.auth.getUser();

  const { data: jobs, error } = await technicianClient
    .from('jobs')
    .select('*')
    .is('deleted_at', null);

  expect(error).toBeNull();

  // RLS: technician only sees jobs where technician_id = auth.uid()
  for (const job of jobs ?? []) {
    expect(job.technician_id).toBe(user!.id);
  }
});
```

---

### TC-TECH-002: Technician Updates Job Status (Valid Transition)
**Priority:** P0  
**Requirement:** FR-JOB-03

```typescript
test('technician should advance job from assigned → en_route', async ({ technicianClient }) => {
  const { data: { user } } = await technicianClient.auth.getUser();

  // Find an assigned job
  const { data: jobs } = await technicianClient
    .from('jobs')
    .select('id, status')
    .eq('status', 'assigned')
    .limit(1);

  if (!jobs || jobs.length === 0) {
    // Create test job via admin and assign
    test.skip();
    return;
  }

  const { data: updated, error } = await technicianClient
    .from('jobs')
    .update({ status: 'en_route' })
    .eq('id', jobs[0].id)
    .select()
    .single();

  expect(error).toBeNull();
  expect(updated.status).toBe('en_route');
});
```

---

### TC-TECH-003: Full Status Progression (Path A — On-Spot)
**Priority:** P0  
**Requirement:** FR-REPAIR-01

```typescript
test('technician should complete full Path A workflow', async () => {
  // Setup: create and assign job via admin
  const { data: job } = await adminClient
    .from('jobs')
    .insert(createJobPayload({ status: 'assigned', technician_id: techUserId }))
    .select().single();

  const transitions = ['en_route', 'diagnosing', 'repairing', 'completed'];

  for (const status of transitions) {
    const { data, error } = await technicianClient
      .from('jobs')
      .update({ status })
      .eq('id', job!.id)
      .select().single();

    expect(error).toBeNull();
    expect(data.status).toBe(status);
  }
});
```

**What this tests:**
- Validates the complete state machine: assigned → en_route → diagnosing → repairing → completed
- Each transition succeeds sequentially
- This is the "happy path" for on-spot repairs

---

### TC-TECH-004: Create Receiving Note (Path B — Shop Repair)
**Priority:** P0  
**Requirement:** FR-REPAIR-02, FR-REPAIR-04

```typescript
test('technician should create receiving note for shop repair', async ({ technicianClient }) => {
  const { data: { user } } = await technicianClient.auth.getUser();

  // Get a diagnosing job
  const { data: job } = await adminClient
    .from('jobs')
    .insert(createJobPayload({
      status: 'diagnosing',
      technician_id: user!.id,
      service_type: 'store_dropoff',
    }))
    .select().single();

  const { data: note, error } = await technicianClient
    .from('receiving_notes')
    .insert({
      job_id: job!.id,
      device_condition: 'Screen cracked top-right, back glass intact, powers on',
      damage_photos: ['https://storage.example.com/photo1.jpg'],
      customer_signature_url: 'https://storage.example.com/sig.png',
      notes: 'Customer confirmed no prior water damage',
    })
    .select().single();

  expect(error).toBeNull();
  expect(note.job_id).toBe(job!.id);
  expect(note.device_condition).toContain('Screen cracked');
  expect(note.customer_signature_url).toBeTruthy();
});
```

---

### TC-TECH-005: Read Receiving Note for Job
**Priority:** P1  
**Requirement:** FR-REPAIR-04

```typescript
test('technician should read receiving note for assigned job', async ({ technicianClient }) => {
  const { data: notes, error } = await technicianClient
    .from('receiving_notes')
    .select('*')
    .is('deleted_at', null)
    .limit(1);

  expect(error).toBeNull();
  // If notes exist, validate structure
  if (notes && notes.length > 0) {
    expect(notes[0].device_condition).toBeTruthy();
    expect(notes[0].job_id).toBeTruthy();
  }
});
```

---

### TC-TECH-006: Create Draft Invoice for Job
**Priority:** P0  
**Requirement:** FR-INV-01

```typescript
test('technician should create draft invoice', async ({ technicianClient }) => {
  const { data: { user } } = await technicianClient.auth.getUser();

  // Get a job assigned to this technician
  const { data: job } = await adminClient
    .from('jobs')
    .insert(createJobPayload({
      status: 'repairing',
      technician_id: user!.id,
    }))
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
  expect(invoice.total).toBe(0);
});
```

---

### TC-TECH-007: Add Line Items to Invoice
**Priority:** P0  
**Requirement:** FR-INV-02

```typescript
test('technician should add part and labor line items', async ({ technicianClient }) => {
  // Assume invoice exists from TC-TECH-006
  const { data: invoices } = await technicianClient
    .from('invoices')
    .select('id, is_locked')
    .eq('is_locked', false)
    .limit(1);

  if (!invoices || invoices.length === 0) { test.skip(); return; }
  const invoiceId = invoices[0].id;

  // Add part
  const { data: partItem, error: partErr } = await technicianClient
    .from('invoice_items')
    .insert({
      invoice_id: invoiceId,
      type: 'part',
      description: 'OEM Screen Assembly — iPhone 15 Pro',
      quantity: 1,
      unit_price: 149.99,
      amount: 149.99,
    })
    .select().single();

  expect(partErr).toBeNull();
  expect(partItem.type).toBe('part');
  expect(partItem.amount).toBe(149.99);

  // Add labor
  const { data: laborItem, error: laborErr } = await technicianClient
    .from('invoice_items')
    .insert({
      invoice_id: invoiceId,
      type: 'labor',
      description: 'Screen replacement labor — 45 min',
      quantity: 1,
      unit_price: 49.99,
      amount: 49.99,
    })
    .select().single();

  expect(laborErr).toBeNull();
  expect(laborItem.type).toBe('labor');
});
```

---

### TC-TECH-008: Remove Line Item from Invoice
**Priority:** P1  
**Requirement:** FR-INV-05

```typescript
test('technician should soft-delete a line item from unlocked invoice', async ({ technicianClient }) => {
  const { data: items } = await technicianClient
    .from('invoice_items')
    .select('id, invoice_id')
    .is('deleted_at', null)
    .limit(1);

  if (!items || items.length === 0) { test.skip(); return; }

  // Check invoice is unlocked
  const { data: inv } = await technicianClient
    .from('invoices')
    .select('is_locked')
    .eq('id', items[0].invoice_id)
    .single();

  if (inv?.is_locked) { test.skip(); return; }

  const { error } = await technicianClient
    .from('invoice_items')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', items[0].id);

  expect(error).toBeNull();

  // Verify soft deleted
  const { data: deleted } = await technicianClient
    .from('invoice_items')
    .select('deleted_at')
    .eq('id', items[0].id)
    .single();

  expect(deleted!.deleted_at).toBeTruthy();
});
```

---

### TC-TECH-009: Technician Cannot Access Other Technician's Jobs
**Priority:** P0  
**Requirement:** NFR-SEC-03

```typescript
test('technician cannot read jobs assigned to another technician', async ({ technicianClient }) => {
  const { data: { user } } = await technicianClient.auth.getUser();

  // All jobs returned must belong to this technician
  const { data: jobs } = await technicianClient
    .from('jobs')
    .select('technician_id')
    .is('deleted_at', null);

  for (const job of jobs ?? []) {
    expect(job.technician_id).toBe(user!.id);
  }
});
```

---

### TC-TECH-010: Cancel Job
**Priority:** P1  
**Requirement:** FR-JOB-03

```typescript
test('technician should be able to cancel an assigned job', async ({ technicianClient }) => {
  const { data: { user } } = await technicianClient.auth.getUser();

  const { data: job } = await adminClient
    .from('jobs')
    .insert(createJobPayload({
      status: 'assigned',
      technician_id: user!.id,
    }))
    .select().single();

  const { data: cancelled, error } = await technicianClient
    .from('jobs')
    .update({ status: 'cancelled' })
    .eq('id', job!.id)
    .select().single();

  expect(error).toBeNull();
  expect(cancelled.status).toBe('cancelled');
});
```

---

## Summary

| Test ID | Test Name | Priority | Expected Result |
|---------|-----------|----------|-----------------|
| TC-TECH-001 | Read Assigned Jobs | P0 | Only assigned jobs visible |
| TC-TECH-002 | Update Status (Valid) | P0 | Status advances correctly |
| TC-TECH-003 | Full Path A Workflow | P0 | Complete lifecycle succeeds |
| TC-TECH-004 | Create Receiving Note | P0 | Note created with all fields |
| TC-TECH-005 | Read Receiving Note | P1 | Note data returned |
| TC-TECH-006 | Create Draft Invoice | P0 | Invoice created as draft |
| TC-TECH-007 | Add Line Items | P0 | Part + labor items added |
| TC-TECH-008 | Remove Line Item | P1 | Item soft-deleted |
| TC-TECH-009 | Cross-Tech Isolation | P0 | Cannot see others' jobs |
| TC-TECH-010 | Cancel Job | P1 | Status set to cancelled |
