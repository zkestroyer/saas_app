# Architecture Decision Records — Revivix Mobile Repair SaaS

This directory contains all Architecture Decision Records (ADRs) for the Revivix platform. ADRs document architecturally significant decisions using the [MADR](https://adr.github.io/madr/) format.

## Decision Log

| ADR | Title | Status | Date | Category |
|-----|-------|--------|------|----------|
| [ADR-001](./ADR-001-supabase-backend-platform.md) | Use Supabase as the Managed Backend Platform | Accepted | 2026-05-10 | Backend Platform |
| [ADR-002](./ADR-002-react-native-expo-managed.md) | React Native + Expo Managed Workflow | Accepted | 2026-05-10 | Mobile Framework |
| [ADR-003](./ADR-003-multi-tenant-rls.md) | Multi-Tenant Architecture via RLS | Accepted | 2026-05-10 | Data Isolation |
| [ADR-004](./ADR-004-zustand-tanstack-query.md) | Zustand + TanStack Query State Management | Accepted | 2026-05-10 | Client Architecture |
| [ADR-005](./ADR-005-file-based-routing.md) | File-Based Routing with Expo Router | Accepted | 2026-05-10 | Navigation |
| [ADR-006](./ADR-006-rbac-four-tier-roles.md) | RBAC with 4-Tier Roles | Accepted | 2026-05-10 | Authorization |
| [ADR-007](./ADR-007-soft-delete-pattern.md) | Soft Delete Pattern via `deleted_at` | Accepted | 2026-05-10 | Data Lifecycle |
| [ADR-008](./ADR-008-dynamic-invoice-payment-lock.md) | Dynamic Invoice Model with Payment Lock | Accepted | 2026-05-10 | Business Logic |
| [ADR-009](./ADR-009-repair-branching-logic.md) | On-Spot vs Shop Repair Branching | Accepted | 2026-05-10 | Core Workflow |
| [ADR-010](./ADR-010-jwt-supabase-auth.md) | JWT Authentication via Supabase Auth | Accepted | 2026-05-10 | Authentication |
| [ADR-011](./ADR-011-audit-trail-logging.md) | Audit Trail Logging for Compliance | Accepted | 2026-05-10 | Compliance |
| [ADR-012](./ADR-012-offline-first-mmkv.md) | Offline-First Strategy with MMKV | Accepted | 2026-05-10 | Caching |
| [ADR-013](./ADR-013-atomic-design-glassmorphism.md) | Atomic Design System + Glassmorphism | Accepted | 2026-05-10 | UI Architecture |
| [ADR-014](./ADR-014-uuid-primary-keys.md) | UUID Primary Keys for All Entities | Accepted | 2026-05-10 | Data Modeling |

## How to Create a New ADR

1. Copy the template from any existing ADR
2. Number sequentially (next: ADR-015)
3. Update this index
4. Set status to `Proposed` until team review, then `Accepted`

## Status Definitions

- **Proposed** — Under review, not yet approved
- **Accepted** — Approved and in effect
- **Deprecated** — No longer relevant but retained for history
- **Superseded** — Replaced by a newer ADR (link to replacement)
