# ADR-006: Role-Based Access Control (RBAC) with 4-Tier Roles

- **Status:** Accepted
- **Date:** 2026-05-10
- **Deciders:** Solution Architect (Maani), Antigravity AI System
- **Category:** Authorization Model

---

## Context

Per **SaaS Blueprint §3**, Revivix defines 4 core user roles with distinct permissions. Per **Master Guidelines Phase 5**, "strict Role-Based Access Control (RBAC)" is mandatory. The system must enforce authorization at both the UI layer (route access) and data layer (RLS policies).

## Decision

Implement a **4-tier flat RBAC model** stored in the `users.role` column as a PostgreSQL CHECK constraint enum.

### Role Definitions

| Role | DB Value | Capabilities |
|------|----------|-------------|
| **Super Admin** | `super_admin` | Platform-wide: tenant billing, global metrics, user management |
| **Tenant (Owner)** | `tenant` | Business-scoped: manage technicians, view all jobs/invoices, analytics |
| **Technician** | `technician` | Job-scoped: receive dispatches, assess devices, create invoices |
| **Customer** | `customer` | Self-scoped: book repairs, track status, view/pay invoices |

### Permission Matrix

| Resource | Customer | Technician | Tenant | Super Admin |
|----------|----------|-----------|--------|-------------|
| Own Profile | CRUD | CRUD | CRUD | CRUD |
| Jobs (own) | CR | RU (assigned) | RU (all tenant) | R (all) |
| Jobs (create) | ✅ | ❌ | ❌ | ❌ |
| Jobs (assign tech) | ❌ | ❌ | ✅ | ✅ |
| Invoices | R (own) | CRU (assigned) | R (all tenant) | R (all) |
| Invoice (lock) | ❌ | ✅ | ✅ | ✅ |
| Receiving Notes | R (own) | CR | R (all tenant) | R (all) |
| Technician list | ❌ | ❌ | R (own tenant) | R (all) |
| Analytics | ❌ | Own stats | Tenant stats | Global stats |
| Tenant management | ❌ | ❌ | ❌ | CRUD |

### Enforcement Layers

1. **Database (RLS)** — PostgreSQL policies check `auth.uid()` → `users.role` for every query
2. **Navigation (Route Groups)** — Expo Router groups `(customer)`, `(technician)`, `(tenant)` physically separate role-specific screens
3. **UI (Conditional Rendering)** — Components check `useAuthStore().user?.role` to show/hide actions

### TypeScript Enum

```typescript
export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  TENANT = 'tenant',
  TECHNICIAN = 'technician',
  CUSTOMER = 'customer',
}
```

## Consequences

### Benefits
- **Simple and auditable** — Flat role model is easy to reason about, test, and audit.
- **Multi-layer enforcement** — Even if UI incorrectly renders an action, RLS blocks unauthorized data access.
- **Extensible** — New roles can be added to the CHECK constraint without schema migration.

### Risks & Mitigations
- **Role granularity** — Flat roles don't support fine-grained permissions (e.g., "technician can create invoices but not delete them"). Currently sufficient; mitigated by adding a `permissions` JSONB column if needed in V2.
- **Role escalation** — A malicious user could attempt to modify their role. Mitigated by RLS: only `super_admin` can UPDATE `users.role`.

## Alternatives Considered

| Alternative | Why Rejected |
|------------|-------------|
| **Attribute-Based Access Control (ABAC)** | More flexible but significantly more complex to implement and audit. Over-engineered for 4 roles. |
| **Permission-based (ACL)** | Separate permissions table with role-permission mappings. Adds join complexity for every authorization check. Not justified at current scale. |

## References
- SaaS Blueprint — §3: Core Roles & Permissions
- Master Guidelines — Phase 5: Security Architecture & Hardening
