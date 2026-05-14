# ADR-011: Audit Trail Logging for Compliance

- **Status:** Accepted
- **Date:** 2026-05-10
- **Deciders:** Solution Architect (Maani), Antigravity AI System
- **Category:** Regulatory & Audit Compliance

---

## Context

Per **Master Guidelines Phase 5 (Security)** and the implementation plan reference to "Master Engineering §3", the system must maintain a complete audit trail of all significant actions. This is critical for:

1. **Financial compliance** — Invoice creation, modification, and payment locking must be traceable
2. **Dispute resolution** — Who changed a job's status and when?
3. **Security forensics** — Detecting unauthorized access patterns
4. **GDPR Article 30** — Records of processing activities

## Decision

Implement an **append-only audit trail table** with a dedicated service that logs all mutations across the system.

### Schema

```sql
audit_trails (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id UUID REFERENCES users(id),  -- Who performed the action
  action VARCHAR(100) NOT NULL,         -- What they did
  target_table VARCHAR(100) NOT NULL,   -- Which entity
  target_id UUID,                       -- Specific record
  metadata JSONB DEFAULT '{}',          -- Action-specific details
  ip_address INET,                      -- Client IP (when available)
  created_at TIMESTAMPTZ DEFAULT NOW()  -- When
  -- NOTE: No updated_at, no deleted_at — audit records are IMMUTABLE
)
```

### Logged Actions

| Action | Trigger | Metadata |
|--------|---------|----------|
| `user.signed_up` | Registration | `{ role, email }` |
| `user.signed_in` | Login | `{ method: 'email' }` |
| `user.signed_out` | Logout | `{}` |
| `job.created` | Customer booking | `{ device, issue_category }` |
| `job.status_changed` | Any status transition | `{ from, to }` |
| `job.technician_assigned` | Tenant assigns tech | `{ technician_id }` |
| `invoice.created` | Tech creates invoice | `{ job_id }` |
| `invoice.item_added` | Line item added | `{ item_type, amount }` |
| `invoice.item_removed` | Line item deleted | `{ item_id, amount }` |
| `invoice.locked` | Payment processed | `{ total, payment_method }` |
| `receiving_note.created` | Path B device handoff | `{ job_id, condition }` |
| `user.profile_updated` | Profile edit | `{ fields_changed }` |

### Service Implementation

```typescript
class AuditService {
  async log(
    actorId: string,
    action: string,
    targetTable: string,
    targetId: string | null,
    metadata: Record<string, unknown> = {}
  ): Promise<void> {
    await supabase.from('audit_trails').insert({
      actor_id: actorId,
      action,
      target_table: targetTable,
      target_id: targetId,
      metadata,
    });
  }
}
```

### Immutability Rules

- Audit records have **no `updated_at` or `deleted_at`** — they are write-once.
- RLS policy: Only `super_admin` can SELECT audit trails. No role can UPDATE or DELETE.
- No application-layer delete function exists for audit records.

## Consequences

### Benefits
- **Complete traceability** — Every significant system action has a who/what/when/where record.
- **Legal protection** — Audit trail serves as evidence in billing disputes or liability claims.
- **Debugging** — "Why was this invoice $200 instead of $150?" can be answered by reviewing the audit trail.
- **GDPR compliance** — Satisfies Article 30 requirements for processing records.

### Risks & Mitigations
- **Storage growth** — High-traffic systems generate many audit records. Mitigated by archival policy (move records older than 2 years to cold storage).
- **Performance** — INSERT for every action adds latency. Mitigated by fire-and-forget pattern (don't await the audit insert in the critical path).
- **Sensitive data in metadata** — Metadata may contain PII. Mitigated by never logging passwords, tokens, or full credit card numbers.

## Alternatives Considered

| Alternative | Why Rejected |
|------------|-------------|
| **Database triggers** | Automatic but harder to include actor context (who). Triggers don't have access to the JWT `auth.uid()` in all contexts. |
| **Event sourcing** | Maximum traceability but requires complete architecture redesign. Over-engineered for current requirements. |
| **External logging (Sentry/Datadog)** | Good for error tracking but not structured enough for business audit requirements. Complementary, not a replacement. |

## References
- Master Guidelines — Phase 5: Security Architecture (§3 Audit Trails)
- GDPR Article 30 — Records of Processing Activities
