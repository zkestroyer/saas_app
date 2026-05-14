# ADR-007: Soft Delete Pattern via `deleted_at` Column

- **Status:** Accepted
- **Date:** 2026-05-10
- **Deciders:** Solution Architect (Maani), Antigravity AI System
- **Category:** Data Lifecycle Management

---

## Context

Per **Master Guidelines Phase 5** and the **SaaS Blueprint §5**, every table must "strictly enforce `created_at`, `updated_at`, and `deleted_at` tracking." Per **Master Guidelines Phase 6 (Data Privacy & Legal Compliance)**, GDPR/PDPA compliance requires "Automated Data Export" and "Account Deletion workflows."

Hard deletion (SQL `DELETE`) destroys audit trails, breaks referential integrity, and makes data recovery impossible. For a SaaS platform handling financial records (invoices), legal requirements may mandate data retention.

## Decision

Implement **soft deletes** using a nullable `deleted_at TIMESTAMPTZ` column on all business tables. Records are never physically deleted; they are marked with a timestamp.

### Implementation

```sql
-- Every table has this column
deleted_at TIMESTAMPTZ  -- NULL = active, non-NULL = soft-deleted

-- "Delete" operation
UPDATE jobs SET deleted_at = NOW() WHERE id = $1;

-- "Read" operations filter soft-deleted records
SELECT * FROM jobs WHERE deleted_at IS NULL;

-- "Hard delete" for GDPR right-to-erasure (admin-only, audited)
DELETE FROM jobs WHERE id = $1;  -- Only via admin function
```

### Tables with Soft Delete

| Table | `deleted_at` | Rationale |
|-------|:----------:|-----------|
| `tenants` | ✅ | Business accounts can be suspended/reactivated |
| `users` | ✅ | User deactivation without data loss |
| `jobs` | ✅ | Job cancellation preserves history |
| `invoices` | ✅ | Financial records must be retained |
| `invoice_items` | ✅ | Line item history for audit |
| `receiving_notes` | ✅ | Device custody chain must be preserved |
| `audit_trails` | ❌ | Audit logs are **never** deleted — immutable by design |

### Auto-Updated Timestamps

A PostgreSQL trigger automatically sets `updated_at = NOW()` on every UPDATE:

```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

## Consequences

### Benefits
- **Data recovery** — Accidental deletions can be reversed by setting `deleted_at = NULL`.
- **Audit compliance** — Complete history of every record's lifecycle is preserved.
- **Referential integrity** — Foreign keys are never broken by deletion.
- **GDPR compliance** — Soft delete satisfies "right to be forgotten" at the application level. True erasure can be performed as a separate admin operation when legally required.

### Risks & Mitigations
- **Query complexity** — Every query must include `WHERE deleted_at IS NULL`. Mitigated by service layer functions that always apply this filter, and RLS policies that include it.
- **Storage growth** — Soft-deleted records consume storage indefinitely. Mitigated by periodic archival of records older than the legal retention period (e.g., 7 years for financial records).
- **Unique constraint conflicts** — A soft-deleted user's email would conflict with a new registration. Mitigated by partial unique indexes: `CREATE UNIQUE INDEX ON users(email) WHERE deleted_at IS NULL;`.

## Alternatives Considered

| Alternative | Why Rejected |
|------------|-------------|
| **Hard delete** | Destroys data irrecoverably. Violates audit trail requirements. Breaks foreign keys. |
| **Archive table** | Moving deleted records to a separate `_archive` table. Adds complexity, requires dual-table queries for historical reports. |
| **Event sourcing** | Full event log with replay capability. Maximum auditability but massive implementation complexity. Over-engineered for current requirements. |

## References
- Master Guidelines — Phase 5: Security Architecture & Hardening
- Master Guidelines — Phase 6: Data Privacy & Legal Compliance
- SaaS Blueprint — §5: Technology Stack & Architecture
