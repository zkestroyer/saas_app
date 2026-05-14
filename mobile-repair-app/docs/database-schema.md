# Revivix — Database Schema Document

> **Document ID:** DOC-DB-001  
> **Version:** 1.0  
> **Date:** 2026-05-14  
> **Author:** Solution Architect (Antigravity AI System)  
> **Classification:** Internal — Next App World  
> **Project:** Revivix Mobile Repair SaaS Platform

---

## 1. Overview

The Revivix database runs on **PostgreSQL 15+** hosted on **Supabase**. All tables follow these conventions per Master Engineering Guidelines:

- **Primary Keys:** UUID v4 (`uuid_generate_v4()`)
- **Timestamps:** `created_at`, `updated_at` (auto-updated via trigger), `deleted_at` (soft delete)
- **Naming:** `snake_case` for tables and columns
- **Foreign Keys:** Explicit `REFERENCES` with appropriate `ON DELETE` behavior
- **Indexes:** On all foreign keys and frequently filtered columns

---

## 2. Entity-Relationship Diagram

```
┌──────────────┐
│   tenants    │
│──────────────│
│ id (PK)      │
│ business_name│
│ plan         │
│ sub_status   │
│ timestamps   │
└──────┬───────┘
       │ 1
       │
       │ ∞
┌──────┴───────┐          ┌──────────────────┐
│    users     │          │  audit_trails     │
│──────────────│          │──────────────────│
│ id (PK/FK)   │◄────────│ actor_id (FK)     │
│ tenant_id(FK)│          │ action            │
│ role         │          │ target_table      │
│ name         │          │ target_id         │
│ email        │          │ metadata (JSONB)  │
│ phone        │          │ ip_address        │
│ timestamps   │          │ created_at        │
└──┬────┬──────┘          └──────────────────┘
   │    │
   │    │ technician_id
   │    │
   │    │         ┌──────────────────┐
   │    └────────▶│      jobs        │
   │ customer_id  │──────────────────│
   └─────────────▶│ id (PK)          │
                  │ customer_id (FK) │
                  │ technician_id(FK)│
                  │ tenant_id (FK)   │
                  │ device_brand     │
                  │ device_model     │
                  │ issue_category   │
                  │ description      │
                  │ photos (JSONB)   │
                  │ service_type     │
                  │ status           │
                  │ location (JSONB) │
                  │ scheduled_at     │
                  │ timestamps       │
                  └──┬────────┬──────┘
                     │        │
                     │ 1      │ 1
                     │        │
                     │ ∞      │ 0..1
          ┌──────────┴──┐  ┌──┴──────────────┐
          │  invoices   │  │ receiving_notes  │
          │─────────────│  │─────────────────│
          │ id (PK)     │  │ id (PK)          │
          │ job_id (FK) │  │ job_id (FK)      │
          │ status      │  │ device_condition │
          │ subtotal    │  │ damage_photos    │
          │ tax_amount  │  │ customer_sig_url │
          │ dispatch_chg│  │ notes            │
          │ total       │  │ timestamps       │
          │ is_locked   │  └─────────────────┘
          │ locked_at   │
          │ payment_mthd│
          │ timestamps  │
          └──────┬──────┘
                 │ 1
                 │
                 │ ∞
          ┌──────┴──────────┐
          │ invoice_items   │
          │─────────────────│
          │ id (PK)         │
          │ invoice_id (FK) │
          │ type            │
          │ description     │
          │ quantity        │
          │ unit_price      │
          │ amount          │
          │ timestamps      │
          └─────────────────┘
```

---

## 3. Table Specifications

### 3.1 `tenants`

Represents a mobile repair business (organization).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT uuid_generate_v4() | Unique tenant identifier |
| `business_name` | VARCHAR(255) | NOT NULL | Company name |
| `plan` | VARCHAR(50) | NOT NULL, DEFAULT 'free' | Subscription plan (free, pro, enterprise) |
| `subscription_status` | VARCHAR(50) | NOT NULL, DEFAULT 'active' | active, suspended, cancelled |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Record creation timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last modification (auto-trigger) |
| `deleted_at` | TIMESTAMPTZ | NULLABLE | Soft delete marker |

### 3.2 `users`

Application user profiles. Links to Supabase `auth.users` via PK.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, FK → auth.users(id) ON DELETE CASCADE | Supabase auth user ID |
| `tenant_id` | UUID | FK → tenants(id), NULLABLE | Owning tenant (NULL for super_admin) |
| `role` | VARCHAR(20) | NOT NULL, CHECK IN ('super_admin','tenant','technician','customer') | RBAC role |
| `name` | VARCHAR(255) | NOT NULL | Display name |
| `email` | VARCHAR(255) | NOT NULL, UNIQUE | Email address |
| `avatar_url` | TEXT | NULLABLE | Profile image URL |
| `phone` | VARCHAR(30) | NULLABLE | Phone number |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| `deleted_at` | TIMESTAMPTZ | NULLABLE | |

**Indexes:** `idx_users_tenant(tenant_id)`, `idx_users_role(role)`

### 3.3 `jobs`

Repair job requests.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT uuid_generate_v4() | |
| `customer_id` | UUID | NOT NULL, FK → users(id) | Requesting customer |
| `technician_id` | UUID | FK → users(id), NULLABLE | Assigned technician (NULL until assigned) |
| `tenant_id` | UUID | NOT NULL, FK → tenants(id) | Owning tenant |
| `device_brand` | VARCHAR(100) | NOT NULL | e.g., Apple, Samsung |
| `device_model` | VARCHAR(100) | NOT NULL | e.g., iPhone 15 Pro |
| `issue_category` | VARCHAR(30) | NOT NULL, CHECK IN (screen, battery, software, charging, camera, speaker, water_damage, other) | |
| `description` | TEXT | NOT NULL | Customer's description of the issue |
| `photos` | JSONB | DEFAULT '[]' | Array of photo URLs |
| `service_type` | VARCHAR(20) | NOT NULL, CHECK IN (home_visit, store_dropoff) | |
| `status` | VARCHAR(20) | NOT NULL, DEFAULT 'pending', CHECK IN (pending, assigned, en_route, diagnosing, repairing, completed, cancelled) | Job state machine |
| `location` | JSONB | DEFAULT '{}' | `{ address, latitude?, longitude? }` |
| `scheduled_at` | TIMESTAMPTZ | NULLABLE | Preferred appointment time |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| `deleted_at` | TIMESTAMPTZ | NULLABLE | |

**Indexes:** `idx_jobs_customer`, `idx_jobs_technician`, `idx_jobs_tenant`, `idx_jobs_status`

### 3.4 `invoices`

Financial records for repair jobs.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT uuid_generate_v4() | |
| `job_id` | UUID | NOT NULL, FK → jobs(id) | Associated repair job |
| `status` | VARCHAR(20) | NOT NULL, DEFAULT 'draft', CHECK IN (draft, quoted, approved, paid, cancelled) | Invoice state |
| `subtotal` | DECIMAL(10,2) | NOT NULL, DEFAULT 0 | Parts + labor total |
| `tax_amount` | DECIMAL(10,2) | NOT NULL, DEFAULT 0 | Calculated tax |
| `dispatch_charge` | DECIMAL(10,2) | NOT NULL, DEFAULT 0 | Visit/dispatch fee |
| `total` | DECIMAL(10,2) | NOT NULL, DEFAULT 0 | subtotal + tax + dispatch |
| `is_locked` | BOOLEAN | NOT NULL, DEFAULT FALSE | **Critical:** TRUE after payment — no further edits |
| `locked_at` | TIMESTAMPTZ | NULLABLE | When payment was processed |
| `payment_method` | VARCHAR(50) | NULLABLE | cash, card, bank_transfer |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| `deleted_at` | TIMESTAMPTZ | NULLABLE | |

**Indexes:** `idx_invoices_job(job_id)`

### 3.5 `invoice_items`

Line items belonging to an invoice.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT uuid_generate_v4() | |
| `invoice_id` | UUID | NOT NULL, FK → invoices(id) ON DELETE CASCADE | Parent invoice |
| `type` | VARCHAR(20) | NOT NULL, CHECK IN (part, labor, tax, dispatch) | Item category |
| `description` | TEXT | NOT NULL | e.g., "OEM Screen Assembly" |
| `quantity` | INTEGER | NOT NULL, DEFAULT 1 | |
| `unit_price` | DECIMAL(10,2) | NOT NULL | Price per unit |
| `amount` | DECIMAL(10,2) | NOT NULL | quantity × unit_price |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| `deleted_at` | TIMESTAMPTZ | NULLABLE | |

**Indexes:** `idx_invoice_items_invoice(invoice_id)`

### 3.6 `receiving_notes`

Device custody documentation for Path B (shop repair) workflow.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT uuid_generate_v4() | |
| `job_id` | UUID | NOT NULL, FK → jobs(id) | Associated job |
| `device_condition` | TEXT | NOT NULL | Technician's condition assessment |
| `damage_photos` | JSONB | DEFAULT '[]' | Photos taken at pickup |
| `customer_signature_url` | TEXT | NULLABLE | Digital signature image URL |
| `notes` | TEXT | NULLABLE | Additional notes |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| `deleted_at` | TIMESTAMPTZ | NULLABLE | |

**Indexes:** `idx_receiving_notes_job(job_id)`

### 3.7 `audit_trails`

Immutable log of all significant system actions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT uuid_generate_v4() | |
| `actor_id` | UUID | FK → users(id), NULLABLE | Who performed the action |
| `action` | VARCHAR(100) | NOT NULL | e.g., `job.created`, `invoice.locked` |
| `target_table` | VARCHAR(100) | NOT NULL | e.g., `jobs`, `invoices` |
| `target_id` | UUID | NULLABLE | Specific record affected |
| `metadata` | JSONB | DEFAULT '{}' | Action-specific context |
| `ip_address` | INET | NULLABLE | Client IP address |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

**Note:** No `updated_at` or `deleted_at` — audit records are immutable.

**Indexes:** `idx_audit_actor(actor_id)`, `idx_audit_action(action)`

---

## 4. Database Triggers

### Auto-Update `updated_at`

```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

Applied to: `tenants`, `users`, `jobs`, `invoices`, `invoice_items`, `receiving_notes`

---

## 5. Row-Level Security Summary

| Table | RLS Enabled | Policies |
|-------|:-----------:|----------|
| `tenants` | ✅ | Members can read own tenant |
| `users` | ✅ | Read/update own profile; tenant reads team |
| `jobs` | ✅ | Customer=own, Tech=assigned, Tenant=all in org |
| `invoices` | ✅ | Via job ownership chain |
| `invoice_items` | ✅ | Via invoice → job ownership chain |
| `receiving_notes` | ✅ | Via job ownership chain |
| `audit_trails` | ✅ | INSERT for auth'd users; SELECT for super_admin only |

---

## 6. Data Volume Estimates

| Table | Year 1 Estimate | Growth Rate |
|-------|----------------|-------------|
| `tenants` | ~50 | +10/month |
| `users` | ~500 | +50/month |
| `jobs` | ~5,000 | +500/month |
| `invoices` | ~5,000 | 1:1 with jobs |
| `invoice_items` | ~20,000 | ~4 per invoice |
| `receiving_notes` | ~1,500 | ~30% of jobs (Path B) |
| `audit_trails` | ~50,000 | ~10 per job lifecycle |
