# Revivix — Software Design Document (SDD)
## Version 1.0

---

## 1. Architecture Overview

Revivix follows a **multi-tenant SaaS architecture** with a React Native mobile client communicating with a Supabase-powered backend.

```
┌─────────────────────────────────┐
│        Mobile Client (Expo)     │
│  ┌──────────┐  ┌─────────────┐ │
│  │  Screens  │←→│   Stores    │ │
│  │ (Expo Rtr)│  │  (Zustand)  │ │
│  └─────┬────┘  └──────┬──────┘ │
│        │               │       │
│  ┌─────▼───────────────▼─────┐ │
│  │      Service Layer         │ │
│  │  (auth, job, invoice...)   │ │
│  └───────────┬───────────────┘ │
│              │ TanStack Query  │
└──────────────┼─────────────────┘
               │ HTTPS
┌──────────────▼─────────────────┐
│      Supabase Backend (Managed)  │
│  ┌──────────┐  ┌────────────┐  │
│  │PostgreSQL │  │    Auth    │  │
│  │ (7 tables)│  │   (JWT)   │  │
│  │ (42 RLS)  │  └────────────┘  │
│  └──────────┘  ┌────────────┐  │
│                │  Storage   │  │
│                └────────────┘  │
└────────────────────────────────┘
```

## 2. Design Patterns

### 2.1 Atomic Design System
Components follow the atomic design methodology:
- **Atoms**: Button, Input, Badge, GlassView
- **Molecules**: StatCard, HapticPress, Shimmer
- **Organisms**: SplashScreen, Tab Layouts
- **Templates**: Screen layouts with SafeAreaView + LinearGradient
- **Pages**: Full screens in `app/` directory

### 2.2 State Management Split
| Type | Tool | Persistence |
|------|------|-------------|
| Client state | Zustand | In-memory (auth, invoice editing) |
| Server state | TanStack Query | 5-min stale cache |
| Offline cache | MMKV (future) | Persistent key-value |

### 2.3 Service Layer Pattern
All database operations go through typed service functions that:
1. Perform the Supabase operation
2. Log to audit trail (fire-and-forget)
3. Return a standardised `ApiResponse<T>` envelope

## 3. Module Design

### 3.1 Authentication Module
- `src/services/auth-service.ts` — signUp, signIn, signOut, getSession, updateProfile
- `src/stores/auth-store.ts` — user state, isAuthenticated, isLoading
- `app/(auth)/` — login, register, forgot-password screens

### 3.2 Job Management Module
- `src/services/job-service.ts` — CRUD + state machine transitions
- `src/stores/job-store.ts` — local job cache (legacy, being deprecated)
- `app/(customer)/booking.tsx` — 4-step booking wizard
- `app/(technician)/job/[id].tsx` — diagnosis + path selection

### 3.3 Invoice Module
- `src/services/invoice-service.ts` — CRUD + lock enforcement
- `src/stores/invoice-store.ts` — active invoice editing session
- `app/(technician)/invoice/[id].tsx` — dynamic invoice builder

### 3.4 Notification Module
- `src/services/notification-service.ts` — registration, channels, local notifications
- Expo Push Notification Service for remote delivery

### 3.5 Analytics Module
- `src/services/analytics-service.ts` — aggregate queries for dashboards

## 4. Security Design

### 4.1 Authentication Flow
```
User → signIn(email, pwd) → Supabase Auth → JWT → stored in SecureStore
                                                 → profile fetched from users table
                                                 → Zustand store updated
```

### 4.2 RLS Policy Architecture
Every table has RLS enabled with role-specific policies:
- **Customers** see only their own data
- **Technicians** see assigned jobs + customer profiles
- **Tenants** see all data within their tenant
- **Super Admin** sees everything
- **Audit trails** are write-only (no UPDATE/DELETE policies)

### 4.3 Invoice Lock Invariant
The payment lock is enforced at three levels:
1. **Application layer**: Service checks `is_locked` before mutations
2. **Database layer**: RLS policies check `is_locked = FALSE` for UPDATE
3. **Atomic guard**: `UPDATE ... WHERE is_locked = FALSE` prevents race conditions

## 5. Data Flow Diagrams

### 5.1 Booking Flow
```
Customer → booking.tsx → jobService.createJob() → Supabase INSERT
         → auditService.logAudit() → audit_trails INSERT
         → TanStack Query invalidation → dashboard refresh
```

### 5.2 Invoice Lock Flow
```
Technician → lockInvoice() → check is_locked=false
           → UPDATE invoices SET is_locked=true, status='paid'
           → updateJobStatus('completed')
           → auditService.logAudit('invoice.locked')
           → notificationService.notifyInvoiceEvent('locked')
```
