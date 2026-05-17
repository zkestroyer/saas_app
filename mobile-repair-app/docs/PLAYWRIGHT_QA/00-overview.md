# Revivix — Playwright QA Automation Suite

> **Document ID:** DOC-QA-001  
> **Version:** 1.0  
> **Date:** 2026-05-17  
> **Project:** Revivix Mobile Repair SaaS Platform  
> **Target:** Playwright E2E + API Testing

---

## 📋 Table of Contents (Files in this folder)

| # | File | Coverage |
|---|------|----------|
| 00 | `00-overview.md` | This file — project summary, architecture, test strategy |
| 01 | `01-setup-and-config.md` | Playwright setup, env config, fixtures, helpers |
| 02 | `02-auth-tests.md` | Authentication test cases (sign up, sign in, sign out, session) |
| 03 | `03-customer-tests.md` | Customer role tests (booking, tracking, invoices, profile) |
| 04 | `04-technician-tests.md` | Technician role tests (jobs, status, invoices, receiving notes) |
| 05 | `05-tenant-tests.md` | Tenant/Business role tests (dashboard, technicians, analytics) |
| 06 | `06-invoice-tests.md` | Invoice lifecycle tests (CRUD, lock, payment, calculations) |
| 07 | `07-rbac-and-rls-tests.md` | Role-based access control & row-level security tests |
| 08 | `08-state-machine-tests.md` | Job status transition validation (state machine) |
| 09 | `09-edge-cases-and-negative.md` | Negative tests, boundary conditions, error handling |

---

## 🏗️ Project Summary

**Revivix** is a multi-tenant SaaS mobile application for managing mobile device repair operations. Built with:

- **Frontend:** React Native (Expo SDK 54) with Expo Router
- **Backend:** Supabase (PostgreSQL 15 + Auth + Storage + Realtime)
- **State:** Zustand (client) + TanStack Query (server)
- **Service Layer:** TypeScript services wrapping `@supabase/supabase-js`

### User Roles

| Role | Route Group | Key Capabilities |
|------|-------------|-----------------|
| **Customer** | `(customer)` | Book repairs, track status, view invoices, manage profile |
| **Technician** | `(technician)` | Manage assigned jobs, update status, build invoices, create receiving notes |
| **Tenant (Business)** | `(tenant)` | Analytics dashboard, manage technicians, view all org jobs |
| **Super Admin** | — | System-wide access, audit trail reads |

### Database Tables

| Table | Purpose |
|-------|---------|
| `tenants` | Business organizations (multi-tenant isolation) |
| `users` | User profiles linked to Supabase Auth |
| `jobs` | Repair job bookings with status state machine |
| `invoices` | Financial records with payment lock mechanism |
| `invoice_items` | Line items (part, labor, tax, dispatch) |
| `receiving_notes` | Device custody documentation (Path B workflow) |
| `audit_trails` | Immutable event log (insert-only, no updates/deletes) |

---

## 🔄 Core Business Workflows

### Workflow A — On-Spot Repair (Home Visit)
```
Customer books job → Tenant assigns technician → Tech goes en_route →
Tech diagnoses → Tech repairs on-spot → Tech creates invoice →
Tech adds line items → Customer pays → Invoice locks → Job completed
```

### Workflow B — Shop Repair (Store Drop-off)
```
Customer books job → Tenant assigns technician → Tech goes en_route →
Tech creates receiving note (device custody) → Tech takes to shop →
Tech diagnoses → Tech repairs → Tech creates invoice →
Customer pays → Invoice locks → Job completed
```

### Job Status State Machine
```
pending → assigned → en_route → diagnosing → repairing → completed
   ↓         ↓          ↓           ↓            ↓
cancelled  cancelled  cancelled   cancelled   cancelled
```

### Invoice Status Lifecycle
```
draft → quoted → approved → paid (LOCKED - irreversible)
  ↓       ↓         ↓
cancelled cancelled cancelled
```

---

## 🎯 Test Strategy

### Testing Approach
Since Revivix is a **React Native mobile app** backed by **Supabase**, Playwright tests target:

1. **API-Level Tests** — Direct Supabase REST/PostgREST API calls to test service layer logic
2. **Web Export Tests** — If Expo web export is available, test the web version UI flows
3. **Admin Panel Tests** — Future web admin panel UI testing

### Test Priority Matrix

| Priority | Category | Count | Description |
|----------|----------|-------|-------------|
| P0 — Critical | Auth, Job Creation, Invoice Lock | ~25 | Must pass for any release |
| P1 — High | Status transitions, RBAC, RLS | ~20 | Core business logic |
| P2 — Medium | Analytics, Notifications, Profile | ~15 | Important user features |
| P3 — Low | Edge cases, UI polish | ~10 | Nice to have |

### API Response Envelope
All service methods return this shape — assert against it:
```typescript
interface ApiResponse<T> {
  success: boolean;   // true = operation succeeded
  message: string;    // Human-readable result
  data: T;            // Payload (null on failure)
  errors: string[];   // Error codes/messages array
}
```

---

## 📂 Key Source Files Reference

| File | Purpose |
|------|---------|
| `src/services/auth-service.ts` | signUp, signIn, signOut, getSession, getCurrentUser, updateProfile |
| `src/services/job-service.ts` | createJob, getCustomerJobs, getTechnicianJobs, getTenantJobs, updateJobStatus, assignTechnician |
| `src/services/invoice-service.ts` | createInvoice, addLineItem, removeLineItem, recalculateTotals, lockInvoice |
| `src/services/receiving-note-service.ts` | createReceivingNote, getReceivingNote |
| `src/services/analytics-service.ts` | getTenantStats, getTechnicianStats, getTenantTechnicians |
| `src/services/audit-service.ts` | logAudit (fire-and-forget) |
| `src/types/index.ts` | All TypeScript enums and interfaces |
| `supabase/schema.sql` | Full database schema + RLS policies |
