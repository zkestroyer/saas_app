# ADR-009: On-Spot vs. Shop Repair Branching Logic

- **Status:** Accepted
- **Date:** 2026-05-10
- **Deciders:** Solution Architect (Maani), Antigravity AI System
- **Category:** Business Logic — Core Workflow

---

## Context

Per **SaaS Blueprint §4.2 (Technician Field & Shop Workflow)**, this is identified as a "Crucial Business Rule":

> After on-site assessment, the technician must choose between two mutually exclusive paths:
> - **Path A (On-Spot Fix):** Minor issue — repair immediately at customer's location
> - **Path B (Shop Repair):** Complex issue — generate a Device Receiving Note, take device to shop

This branching affects the entire downstream workflow: invoice generation timing, device custody chain, customer communication, and job status tracking.

## Decision

Implement branching as a **technician-initiated decision point** after the diagnosis step, with each path triggering distinct system behaviors.

### Workflow Diagram

```
Customer Books Job
       │
       ▼
Job Status: PENDING
       │
       ▼ (Tenant assigns technician)
Job Status: ASSIGNED
       │
       ▼ (Technician starts travel)
Job Status: EN_ROUTE
       │
       ▼ (Technician arrives, inspects device)
Job Status: DIAGNOSING
       │
       ▼ Technician makes assessment
       │
       ├──── PATH A: On-Spot Fix ────┐
       │                              │
       │  • Status → REPAIRING       │
       │  • Repair at location        │
       │  • Create invoice (draft)    │
       │  • Add line items            │
       │  • Lock & collect payment    │
       │  • Status → COMPLETED       │
       │                              │
       ├──── PATH B: Shop Repair ────┐
       │                              │
       │  • Generate Receiving Note   │
       │  • Customer signs digitally  │
       │  • Status → REPAIRING       │
       │  • Take device to shop       │
       │  • Repair at shop            │
       │  • Create invoice (draft)    │
       │  • Notify customer           │
       │  • Customer pays             │
       │  • Lock invoice              │
       │  • Redeliver device          │
       │  • Status → COMPLETED       │
       │                              │
       └──────────────────────────────┘
```

### Receiving Note (Path B Only)

```sql
receiving_notes (
  id UUID PRIMARY KEY,
  job_id UUID REFERENCES jobs(id),
  device_condition TEXT NOT NULL,     -- Technician's assessment
  damage_photos JSONB DEFAULT '[]',  -- Photos taken at pickup
  customer_signature_url TEXT,       -- Digital signature
  notes TEXT,                        -- Additional notes
  created_at, updated_at, deleted_at
)
```

The receiving note serves as:
1. **Legal proof of custody** — Technician took possession of the device
2. **Condition baseline** — Any pre-existing damage is documented
3. **Customer acknowledgment** — Digital signature confirms handoff

### Implementation in UI

The technician's job detail screen (`job/[id].tsx`) presents two cards after diagnosis:
- ⚡ **Path A: On-Spot Fix** → navigates directly to invoice builder
- 🏪 **Path B: Shop Repair** → collects device condition + signature → creates receiving note → navigates to invoice builder

## Consequences

### Benefits
- **Real-world alignment** — Mirrors actual mobile repair business workflow.
- **Device accountability** — Path B creates an auditable chain of custody document.
- **Flexible invoicing** — Both paths converge at the invoice builder, so the billing model is consistent regardless of repair path.

### Risks & Mitigations
- **Path change** — A technician may select Path A but realize mid-repair that they need shop equipment. Mitigated by allowing status to transition back to DIAGNOSING (future enhancement) or by creating a receiving note post-hoc.
- **Device loss** — If a device taken to the shop is lost, the receiving note provides legal evidence of custody transfer. Mitigated by requiring photo documentation and digital signature.

## Alternatives Considered

| Alternative | Why Rejected |
|------------|-------------|
| **Single linear workflow** | Forces all repairs through the same steps. Doesn't reflect the real-world distinction between quick fixes and complex repairs. |
| **Customer-initiated path selection** | Customers don't have the expertise to assess repair complexity. This must be a technician's professional judgment. |

## References
- SaaS Blueprint — §4.2: Technician Field & Shop Workflow
