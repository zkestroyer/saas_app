# Revivix — Software Requirements Specification (SRS)
## Version 1.0

---

## 1. Introduction

### 1.1 Purpose
This document specifies the functional and non-functional requirements for **Revivix**, a multi-tenant mobile repair SaaS platform connecting customers with certified repair technicians.

### 1.2 Scope
Revivix is a React Native (Expo) mobile application backed by Supabase (PostgreSQL). It serves four user roles: Super Admin, Tenant (Business Owner), Technician, and Customer.

### 1.3 Definitions
| Term | Definition |
|------|-----------|
| Tenant | A business entity that employs technicians |
| RLS | Row-Level Security — database-level data isolation |
| Path A | On-spot repair completed at customer location |
| Path B | Shop repair requiring device custody transfer |
| Payment Lock | Irreversible invoice freeze after payment |

---

## 2. Overall Description

### 2.1 Product Perspective
Revivix operates as a SaaS platform where multiple repair businesses (tenants) can manage their operations. Each tenant has isolated data via PostgreSQL RLS policies.

### 2.2 User Classes
| Role | Description | Key Actions |
|------|-------------|-------------|
| Customer | End user needing device repair | Book repairs, track status, view invoices |
| Technician | Repair professional | Manage jobs, diagnose, build invoices |
| Tenant | Business owner | Dashboard analytics, manage technicians, view all jobs |
| Super Admin | Platform administrator | System-wide access, audit trails |

### 2.3 Operating Environment
- **Mobile:** iOS 15+, Android 10+ (API 29+)
- **Backend:** Supabase (PostgreSQL 15, Auth, Storage, Realtime)
- **Build:** Expo SDK 54, EAS Build

---

## 3. Functional Requirements

### 3.1 Authentication (FR-AUTH)
- FR-AUTH-01: Users can register with email, password, name, phone, and role selection
- FR-AUTH-02: Users can sign in with email/password
- FR-AUTH-03: Users can reset their password via email link
- FR-AUTH-04: Sessions persist across app restarts via Supabase Auth
- FR-AUTH-05: Users can sign out, clearing all local state
- FR-AUTH-06: Demo mode available for presentations without Supabase

### 3.2 Job Booking (FR-JOB)
- FR-JOB-01: Customers can create repair bookings via 4-step wizard
- FR-JOB-02: Bookings capture device brand, model, issue category, description, photos, and service type
- FR-JOB-03: Jobs follow a state machine: pending → assigned → en_route → diagnosing → repairing → completed
- FR-JOB-04: Tenant owners can assign technicians to pending jobs
- FR-JOB-05: Customers can track repair status in real-time

### 3.3 Repair Workflow (FR-REPAIR)
- FR-REPAIR-01: Path A (On-Spot): Technician repairs device at customer location, generates invoice immediately
- FR-REPAIR-02: Path B (Shop): Technician creates receiving note documenting device condition, takes device to shop
- FR-REPAIR-03: Technicians can add diagnosis notes to jobs
- FR-REPAIR-04: Receiving notes include device condition, damage photos, and notes

### 3.4 Invoicing (FR-INV)
- FR-INV-01: Technicians create draft invoices for jobs
- FR-INV-02: Line items support types: part, labor, tax, dispatch
- FR-INV-03: Invoice totals auto-recalculate when items are added/removed
- FR-INV-04: Tax is computed at 8% of subtotal (parts + labor)
- FR-INV-05: **CRITICAL**: Invoices remain editable until payment lock
- FR-INV-06: **CRITICAL**: Once locked, NO mutations are permitted (immutable)

### 3.5 Notifications (FR-NOTIF)
- FR-NOTIF-01: Push notifications for job status changes
- FR-NOTIF-02: Push notifications for invoice events
- FR-NOTIF-03: Users can toggle notification preferences in settings
- FR-NOTIF-04: Tapping a notification navigates to the relevant screen

### 3.6 Analytics (FR-ANALYTICS)
- FR-ANALYTICS-01: Tenant dashboard shows monthly revenue, active jobs, technician count, completion rate
- FR-ANALYTICS-02: Technician HUD shows today's jobs, earnings, weekly repair volume chart
- FR-ANALYTICS-03: Revenue breakdown by issue category

---

## 4. Non-Functional Requirements

### 4.1 Performance
- NFR-PERF-01: App cold start < 3 seconds on mid-range devices
- NFR-PERF-02: Screen transitions < 300ms
- NFR-PERF-03: API response caching with 5-minute stale time

### 4.2 Security
- NFR-SEC-01: All data encrypted in transit (HTTPS/TLS)
- NFR-SEC-02: JWT-based authentication with auto-refresh
- NFR-SEC-03: Row-Level Security on all database tables
- NFR-SEC-04: Environment variables protected via .env (never committed)
- NFR-SEC-05: Audit trail logging for all business-critical mutations

### 4.3 Reliability
- NFR-REL-01: Graceful error handling on all service calls
- NFR-REL-02: Audit logging is fire-and-forget (never blocks critical path)
- NFR-REL-03: Soft deletes prevent data loss

### 4.4 Scalability
- NFR-SCALE-01: Multi-tenant architecture supports unlimited tenants
- NFR-SCALE-02: Database indexed on foreign keys and status columns
- NFR-SCALE-03: Stateless service layer enables horizontal scaling

---

## 5. Data Requirements

### 5.1 Database Tables
| Table | Records | Purpose |
|-------|---------|---------|
| tenants | Business entities | Multi-tenant isolation |
| users | All user profiles | Auth + RBAC |
| jobs | Repair bookings | Core workflow |
| invoices | Financial documents | Billing |
| invoice_items | Line items | Invoice detail |
| receiving_notes | Device custody docs | Path B workflow |
| audit_trails | Immutable event log | Compliance |

### 5.2 Data Retention
- Active records: Indefinite
- Soft-deleted records: 90-day retention before permanent purge (future)
- Audit trails: Immutable, never deleted

---

## 6. External Interfaces

### 6.1 Supabase API
- PostgreSQL REST API via `@supabase/supabase-js`
- Supabase Auth for JWT token management
- Supabase Realtime for live subscriptions (future)

### 6.2 Expo Services
- EAS Build for APK/AAB generation
- Expo Push Notification Service for remote notifications
- Expo Image Picker for device photos
