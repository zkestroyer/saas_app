# ADR-008: Dynamic Invoice Model with Payment Lock

- **Status:** Accepted
- **Date:** 2026-05-10
- **Deciders:** Solution Architect (Maani), Antigravity AI System
- **Category:** Business Logic — Invoicing

---

## Context

Per **SaaS Blueprint §4.3 (Dynamic Invoicing & Quotations)**, this is the most complex business rule in the system:

> *"Critical Requirement: Mobile repairs often reveal hidden hardware issues once the device is opened. The invoice MUST remain fully editable and dynamic up until the exact moment of final payment."*

The invoice lifecycle must support:
1. **Draft creation** after technician assessment
2. **Dynamic line item management** — add/remove parts, labor, tax, dispatch charges at any time
3. **Real-time total recalculation** on every change
4. **Quotation approval** — customer reviews and approves before major work
5. **Payment lock** — once paid, the invoice becomes permanently immutable
6. **Itemized billing** — parts, labor, tax, and dispatch clearly separated

## Decision

Implement a **mutable-until-locked invoice model** with a dedicated `is_locked` boolean flag and explicit state machine.

### Invoice State Machine

```
    ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
    │  DRAFT   │────▶│  QUOTED  │────▶│ APPROVED │────▶│   PAID   │
    │          │     │          │     │          │     │ (LOCKED) │
    └──────────┘     └──────────┘     └──────────┘     └──────────┘
         │                │                │                │
         │    Items       │    Customer    │   Payment      │
         │    editable    │    reviews     │   processed    │
         │                │                │                │
         ▼                ▼                ▼                ▼
    [is_locked=F]    [is_locked=F]    [is_locked=F]    [is_locked=T]
                                                       [locked_at=NOW]
```

### Database Schema

```sql
-- Invoices (header)
invoices (
  id UUID PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES jobs(id),
  status VARCHAR(20) CHECK (status IN ('draft','quoted','approved','paid','cancelled')),
  subtotal DECIMAL(10,2) DEFAULT 0,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  dispatch_charge DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) DEFAULT 0,
  is_locked BOOLEAN DEFAULT FALSE,       -- THE CRITICAL FLAG
  locked_at TIMESTAMPTZ,                  -- When payment occurred
  payment_method VARCHAR(50),
  ...
)

-- Invoice Items (line items)
invoice_items (
  id UUID PRIMARY KEY,
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
  type VARCHAR(20) CHECK (type IN ('part','labor','tax','dispatch')),
  description TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,          -- quantity × unit_price
  ...
)
```

### Business Rules (Service Layer Enforcement)

```typescript
// RULE 1: All mutations check lock status FIRST
async function addLineItem(invoiceId: string, item: NewItem) {
  const invoice = await getInvoice(invoiceId);
  if (invoice.is_locked) {
    return { success: false, error: 'Invoice is locked after payment' };
  }
  // ... proceed with insert
}

// RULE 2: Lock is irreversible (no unlock operation exists)
async function lockInvoice(invoiceId: string, paymentMethod: string) {
  await supabase.from('invoices').update({
    status: 'paid',
    is_locked: true,
    locked_at: new Date().toISOString(),
    payment_method: paymentMethod,
  }).eq('id', invoiceId);
  // Log to audit trail
}

// RULE 3: Totals recalculated on every item change
async function recalculateTotals(invoiceId: string) {
  const { data: items } = await supabase
    .from('invoice_items')
    .select('*')
    .eq('invoice_id', invoiceId)
    .is('deleted_at', null);
  
  const subtotal = items.filter(i => i.type !== 'tax' && i.type !== 'dispatch')
    .reduce((sum, i) => sum + i.amount, 0);
  const taxAmount = subtotal * TAX_RATE;
  const dispatchCharge = items.filter(i => i.type === 'dispatch')
    .reduce((sum, i) => sum + i.amount, 0);
  const total = subtotal + taxAmount + dispatchCharge;
  
  await supabase.from('invoices').update({ subtotal, tax_amount: taxAmount, dispatch_charge: dispatchCharge, total })
    .eq('id', invoiceId);
}
```

## Consequences

### Benefits
- **Reflects real-world workflow** — Technicians frequently discover additional issues mid-repair. The editable invoice accommodates this without workarounds.
- **Financial integrity** — Once locked, the invoice is an immutable financial record suitable for accounting and tax compliance.
- **Clear audit trail** — Every state transition is logged to `audit_trails` with actor, timestamp, and metadata.

### Risks & Mitigations
- **Race condition on lock** — Two simultaneous lock attempts could cause inconsistency. Mitigated by using PostgreSQL's `UPDATE ... WHERE is_locked = FALSE` to ensure atomicity.
- **Dispute resolution** — A locked invoice cannot be modified. If a dispute arises, a new "credit note" invoice should be created rather than unlocking the original. This is a V2 feature.

## Alternatives Considered

| Alternative | Why Rejected |
|------------|-------------|
| **Immutable invoices (new version on each change)** | Creates version chains that are complex to query and display. Customers would see multiple invoice versions. |
| **Time-window editability (e.g., editable for 24 hours)** | Arbitrary time limits don't align with real repair workflows. A complex repair may take days. |
| **Separate quotation and invoice entities** | Adds data model complexity. The current status-based approach (draft→quoted→approved→paid) achieves the same lifecycle in a single entity. |

## References
- SaaS Blueprint — §4.3: Dynamic Invoicing & Quotations (Complex Logic)
- Master Guidelines — Phase 5: Security Architecture
