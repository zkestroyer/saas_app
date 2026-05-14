# ADR-003: Multi-Tenant Architecture via Row-Level Security (RLS)

- **Status:** Accepted
- **Date:** 2026-05-10
- **Deciders:** Solution Architect (Maani), Antigravity AI System
- **Category:** Data Isolation & Security

---

## Context

Revivix is a **multi-tenant SaaS platform** serving multiple independent mobile repair businesses (tenants). Each tenant has their own technicians, customers, jobs, and invoices. Per **SaaS Blueprint §1**, the platform is explicitly defined as "Multi-Tenant SaaS."

Critical data isolation requirements:
- Tenant A's data must be **completely invisible** to Tenant B's users
- Customers see only their own jobs and invoices
- Technicians see only jobs assigned to them within their tenant
- Tenant owners see all data within their tenant
- Super Admins see cross-tenant data for platform management

Per **Master Guidelines Phase 5**, the system must implement "strict Role-Based Access Control (RBAC)" with "prepared statements (zero SQL Injection)."

## Decision

Implement multi-tenant data isolation using **PostgreSQL Row-Level Security (RLS)** policies enforced at the database level via Supabase, combined with a `tenant_id` foreign key on all tenant-scoped tables.

### Architecture

```
┌─────────────────────────────────────────────────┐
│                 Supabase Client                  │
│          (authenticated with JWT token)          │
└──────────────────────┬──────────────────────────┘
                       │ HTTP + JWT
                       ▼
┌─────────────────────────────────────────────────┐
│              PostgREST (Auto API)               │
│        Extracts auth.uid() from JWT             │
└──────────────────────┬──────────────────────────┘
                       │ SQL + RLS check
                       ▼
┌─────────────────────────────────────────────────┐
│              PostgreSQL + RLS                    │
│  ┌───────────────────────────────────────────┐  │
│  │  Policy: "Customers read own jobs"        │  │
│  │  FOR SELECT USING (customer_id = uid())   │  │
│  └───────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────┐  │
│  │  Policy: "Tenant reads all tenant jobs"   │  │
│  │  FOR SELECT USING (tenant_id IN           │  │
│  │    (SELECT tenant_id FROM users           │  │
│  │     WHERE id = uid() AND role='tenant'))  │  │
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

### Tenant-Scoped Tables

Every business-data table includes `tenant_id UUID NOT NULL REFERENCES tenants(id)`:
- `users` — employees and customers belong to a tenant
- `jobs` — repair jobs are tenant-scoped
- `invoices` — financial data is tenant-scoped (via job → tenant)
- `receiving_notes` — device intake records are tenant-scoped (via job → tenant)

### RLS Policy Strategy

| Role | Jobs | Invoices | Users |
|------|------|----------|-------|
| Customer | SELECT own (`customer_id = uid()`) | SELECT own (via job) | SELECT own profile |
| Technician | SELECT assigned (`technician_id = uid()`) | INSERT/UPDATE on assigned jobs | SELECT own profile |
| Tenant | SELECT/UPDATE all within tenant | SELECT all within tenant | SELECT all within tenant |
| Super Admin | SELECT all | SELECT all | SELECT all |

## Consequences

### Benefits
- **Defense in depth** — Even if application code has a bug that constructs the wrong query, RLS prevents data leakage. The database is the last line of defense.
- **Zero application-layer filtering** — No `WHERE tenant_id = ?` sprinkled across every query in application code. RLS handles it transparently.
- **Audit-friendly** — Policies are declarative SQL, easily reviewed by security auditors.
- **Performance** — PostgreSQL evaluates RLS policies as part of the query plan, not as post-filter. Indexed `tenant_id` columns ensure O(log n) lookups.

### Risks & Mitigations
- **Policy complexity** — As the number of roles and operations grows, RLS policies become harder to reason about. Mitigated by documenting every policy in this ADR and the schema file.
- **Service role bypass** — The Supabase `service_role` key bypasses RLS. This key must NEVER be embedded in client code. It is restricted to server-side functions only.
- **Testing difficulty** — RLS policies are hard to unit-test from the client. Mitigated by integration testing with multiple user accounts in different tenants.

## Alternatives Considered

| Alternative | Why Rejected |
|------------|-------------|
| **Application-layer filtering** | Every query would need `WHERE tenant_id = ?`. Error-prone, easy to forget, no defense in depth. Violates Master Guidelines Phase 5 security requirements. |
| **Separate databases per tenant** | Maximum isolation but operationally expensive. Schema migrations must be applied to every tenant database. Not feasible at scale for a SaaS MVP. |
| **Separate schemas per tenant** | Better than separate databases but still requires connection pooling per schema and complex migration tooling. Over-engineered for current scale. |

## References
- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS Documentation](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- Master Guidelines — Phase 5: Security Architecture & Hardening
- SaaS Blueprint — §1: Multi-Tenant SaaS Platform
