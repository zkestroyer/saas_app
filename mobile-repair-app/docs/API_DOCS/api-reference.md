# Revivix — API Reference (Service Layer)

> **Document ID:** DOC-API-001  
> **Version:** 1.0  
> **Date:** 2026-05-14  
> **Author:** Solution Architect (Antigravity AI System)  
> **Classification:** Internal — Next App World  
> **Project:** Revivix Mobile Repair SaaS Platform

---

## 1. Overview

Revivix uses a **service layer pattern** where TypeScript service classes wrap Supabase client SDK calls. There is no custom REST API server — all data access goes through `@supabase/supabase-js` which communicates with Supabase's auto-generated PostgREST API.

All service methods return a standardized response envelope:

```typescript
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors: string[];
}
```

---

## 2. Auth Service (`src/services/auth-service.ts`)

### `signUp(email, password, name, phone, role, tenantId?)`

Creates a new user account via Supabase Auth and inserts the application profile.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `email` | string | ✅ | User's email address |
| `password` | string | ✅ | Minimum 6 characters |
| `name` | string | ✅ | Display name |
| `phone` | string | ❌ | Phone number |
| `role` | UserRole | ✅ | One of: customer, technician, tenant |
| `tenantId` | string | ❌ | Required for technician/customer roles |

**Returns:** `ApiResponse<User>`

**Flow:**
1. `supabase.auth.signUp({ email, password })`
2. `supabase.from('users').insert({ id: authUser.id, ...profile })`
3. Log `user.signed_up` to audit trail

---

### `signIn(email, password)`

Authenticates an existing user.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `email` | string | ✅ | Registered email |
| `password` | string | ✅ | Account password |

**Returns:** `ApiResponse<{ user: User; session: Session }>`

**Flow:**
1. `supabase.auth.signInWithPassword({ email, password })`
2. Fetch user profile from `users` table
3. Log `user.signed_in` to audit trail

---

### `signOut()`

Signs out the current user and clears the session.

**Returns:** `ApiResponse<null>`

---

### `getSession()`

Retrieves the current active session (for app restart restoration).

**Returns:** `ApiResponse<Session | null>`

---

### `getCurrentUser()`

Fetches the full user profile for the authenticated user.

**Returns:** `ApiResponse<User>`

---

## 3. Job Service (`src/services/job-service.ts`)

### `createJob(data)`

Creates a new repair job booking.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data.customer_id` | string | ✅ | Booking customer |
| `data.tenant_id` | string | ✅ | Target tenant |
| `data.device_brand` | string | ✅ | Device manufacturer |
| `data.device_model` | string | ✅ | Device model name |
| `data.issue_category` | IssueCategory | ✅ | Problem category enum |
| `data.description` | string | ✅ | Detailed issue description |
| `data.photos` | string[] | ❌ | Damage photo URLs |
| `data.service_type` | ServiceType | ✅ | home_visit or store_dropoff |
| `data.location` | object | ❌ | Address + coordinates |

**Returns:** `ApiResponse<Job>`

---

### `getCustomerJobs(customerId)`

Retrieves all active (non-deleted) jobs for a customer.

**Returns:** `ApiResponse<Job[]>` — Ordered by `created_at DESC`

---

### `getTechnicianJobs(technicianId)`

Retrieves all jobs assigned to a technician.

**Returns:** `ApiResponse<Job[]>` — Ordered by status priority (assigned first)

---

### `getTenantJobs(tenantId)`

Retrieves all jobs within a tenant (for owner dashboard).

**Returns:** `ApiResponse<Job[]>` — Ordered by `created_at DESC`

---

### `getJobById(jobId)`

Fetches a single job with related customer, technician, and invoice data.

**Returns:** `ApiResponse<Job>` — With populated relations

---

### `updateJobStatus(jobId, status, actorId)`

Transitions a job to a new status. Validates state machine transitions.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `jobId` | string | ✅ | Target job |
| `status` | JobStatus | ✅ | New status value |
| `actorId` | string | ✅ | User performing the action |

**Valid Transitions:**
```
pending → assigned → en_route → diagnosing → repairing → completed
Any state → cancelled
```

**Returns:** `ApiResponse<Job>`

---

### `assignTechnician(jobId, technicianId, actorId)`

Assigns a technician to a pending job.

**Returns:** `ApiResponse<Job>`

---

## 4. Invoice Service (`src/services/invoice-service.ts`)

### `createInvoice(jobId)`

Creates a draft invoice for a job.

**Returns:** `ApiResponse<Invoice>`

---

### `getInvoice(invoiceId)`

Fetches an invoice with all line items.

**Returns:** `ApiResponse<Invoice>` — With `items: InvoiceItem[]`

---

### `getCustomerInvoices(customerId)`

Retrieves all invoices for a customer (via job relationship).

**Returns:** `ApiResponse<Invoice[]>`

---

### `addLineItem(invoiceId, item, actorId)`

Adds a line item to an unlocked invoice. **Rejects if `is_locked === true`.**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `invoiceId` | string | ✅ | Target invoice |
| `item.type` | InvoiceItemType | ✅ | part, labor, tax, dispatch |
| `item.description` | string | ✅ | Item description |
| `item.quantity` | number | ✅ | Quantity |
| `item.unit_price` | number | ✅ | Price per unit |
| `actorId` | string | ✅ | Acting user |

**Returns:** `ApiResponse<InvoiceItem>`

**Side Effect:** Triggers `recalculateTotals(invoiceId)`

---

### `removeLineItem(itemId, invoiceId, actorId)`

Soft-deletes a line item from an unlocked invoice.

**Returns:** `ApiResponse<null>`

**Side Effect:** Triggers `recalculateTotals(invoiceId)`

---

### `recalculateTotals(invoiceId)`

Recalculates subtotal, tax, dispatch, and total from active line items.

**Returns:** `ApiResponse<Invoice>` — Updated totals

---

### `lockInvoice(invoiceId, paymentMethod, actorId)`

Permanently locks an invoice after payment. **Irreversible.**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `invoiceId` | string | ✅ | Target invoice |
| `paymentMethod` | string | ✅ | cash, card, bank_transfer |
| `actorId` | string | ✅ | Acting user |

**Returns:** `ApiResponse<Invoice>` — With `is_locked: true`, `status: 'paid'`

---

## 5. Receiving Note Service (`src/services/receiving-note-service.ts`)

### `createReceivingNote(data)`

Creates a device receiving note for Path B (shop repair) workflow.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data.job_id` | string | ✅ | Associated job |
| `data.device_condition` | string | ✅ | Condition assessment |
| `data.damage_photos` | string[] | ❌ | Photo URLs |
| `data.customer_signature_url` | string | ❌ | Signature image URL |
| `data.notes` | string | ❌ | Additional notes |

**Returns:** `ApiResponse<ReceivingNote>`

---

### `getReceivingNote(jobId)`

Fetches the receiving note for a job (if exists).

**Returns:** `ApiResponse<ReceivingNote | null>`

---

## 6. Analytics Service (`src/services/analytics-service.ts`)

### `getTenantStats(tenantId)`

Aggregates business metrics for the tenant dashboard.

**Returns:**
```typescript
ApiResponse<{
  activeJobs: number;
  monthlyRevenue: number;
  revenueChange: number;      // % vs previous month
  technicianCount: number;
  completionRate: number;      // completed / total %
  averageRating: number;
  revenueByCategory: { category: string; amount: number; percentage: number }[];
}>
```

---

### `getTechnicianStats(technicianId)`

Aggregates daily metrics for the technician HUD.

**Returns:**
```typescript
ApiResponse<{
  todayJobs: number;
  todayEarnings: number;
  weeklyVolume: number[];     // 7-day array
}>
```

---

## 7. Audit Service (`src/services/audit-service.ts`)

### `log(actorId, action, targetTable, targetId, metadata)`

Inserts an immutable audit record. Fire-and-forget — does not throw on failure.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `actorId` | string | ✅ | Who performed the action |
| `action` | string | ✅ | Action identifier (e.g., `job.created`) |
| `targetTable` | string | ✅ | Affected table name |
| `targetId` | string | ❌ | Specific record ID |
| `metadata` | object | ❌ | Additional context |

**Returns:** `void` (fire-and-forget)

---

## 8. Error Codes

| Code | Meaning | Example |
|------|---------|---------|
| `AUTH_INVALID_CREDENTIALS` | Wrong email/password | Sign-in failure |
| `AUTH_EMAIL_EXISTS` | Email already registered | Sign-up duplicate |
| `AUTH_SESSION_EXPIRED` | JWT token expired | Auto-refresh failed |
| `INVOICE_LOCKED` | Attempted edit on locked invoice | Add item after payment |
| `INVALID_STATUS_TRANSITION` | Invalid job state change | pending → completed (skip) |
| `RLS_VIOLATION` | User lacks permission | Customer accessing other's job |
| `VALIDATION_ERROR` | Input validation failed | Missing required field |
| `NETWORK_ERROR` | Cannot reach Supabase | Offline |
