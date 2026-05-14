# Revivix — System Architecture Document

> **Document ID:** DOC-SA-001  
> **Version:** 1.0  
> **Date:** 2026-05-14  
> **Author:** Solution Architect (Antigravity AI System)  
> **Classification:** Internal — Next App World  
> **Project:** Revivix Mobile Repair SaaS Platform

---

## 1. Executive Summary

Revivix is a **multi-tenant SaaS platform** for mobile repair businesses. It provides end-to-end workflow management from customer booking through technician dispatch, device repair, dynamic invoicing, and payment collection.

The system is built on a **multi-tenant SaaS architecture** powered by Supabase (PostgreSQL + Auth + Storage + Realtime) as the managed backend, with a React Native mobile client powered by Expo SDK 54.

---

## 2. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      PRESENTATION LAYER                         │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  Customer    │  │  Technician  │  │    Tenant    │         │
│  │  Mobile App  │  │  Mobile App  │  │  Mobile App  │         │
│  │  (Expo RN)   │  │  (Expo RN)   │  │  (Expo RN)   │         │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
│         │                  │                  │                 │
│         └──────────────────┼──────────────────┘                 │
│                            │                                    │
│  ┌─────────────────────────┼─────────────────────────────────┐ │
│  │          SERVICE LAYER (TypeScript)                        │ │
│  │                                                           │ │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────────────┐│ │
│  │  │  Auth   │ │   Job   │ │ Invoice │ │ Receiving Note  ││ │
│  │  │ Service │ │ Service │ │ Service │ │    Service      ││ │
│  │  └────┬────┘ └────┬────┘ └────┬────┘ └───────┬─────────┘│ │
│  │       │           │           │               │          │ │
│  │  ┌────┴────┐ ┌────┴────────────────────┐               │ │
│  │  │  Audit  │ │      Analytics          │               │ │
│  │  │ Service │ │       Service           │               │ │
│  │  └────┬────┘ └────┬────────────────────┘               │ │
│  └───────┼───────────┼──────────────────────────────────────┘ │
│          │           │                                        │
│  ┌───────┼───────────┼──────────────────────────────────────┐ │
│  │       STATE MANAGEMENT LAYER                              │ │
│  │                                                           │ │
│  │  ┌──────────┐    ┌──────────────────┐                   │ │
│  │  │  Zustand  │    │  TanStack Query  │                   │ │
│  │  │ (Client)  │    │  (Server Cache)  │                   │ │
│  │  └──────────┘    └──────────────────┘                   │ │
│  └───────────────────────────────────────────────────────────┘ │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTPS + JWT
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                       DATA LAYER                                │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                   Supabase Platform                      │   │
│  │                                                         │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐│   │
│  │  │  Auth    │  │ PostgREST│  │ Realtime │  │Storage ││   │
│  │  │ (GoTrue) │  │  (API)   │  │ (WS)     │  │(S3)    ││   │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘  └───┬────┘│   │
│  │       │              │              │            │     │   │
│  │       └──────────────┼──────────────┘            │     │   │
│  │                      ▼                           │     │   │
│  │  ┌──────────────────────────────────────────┐   │     │   │
│  │  │         PostgreSQL Database              │   │     │   │
│  │  │                                          │   │     │   │
│  │  │  ┌──────────┐  ┌──────────┐             │   │     │   │
│  │  │  │ Tables   │  │   RLS    │             │   │     │   │
│  │  │  │ (7 core) │  │ Policies │             │   │     │   │
│  │  │  └──────────┘  └──────────┘             │   │     │   │
│  │  │                                          │   │     │   │
│  │  │  ┌──────────┐  ┌──────────┐             │   │     │   │
│  │  │  │ Triggers │  │ Indexes  │             │   │     │   │
│  │  │  │(updated_at│  │(FK,status│             │   │     │   │
│  │  │  └──────────┘  └──────────┘             │   │     │   │
│  │  └──────────────────────────────────────────┘   │     │   │
│  └─────────────────────────────────────────────────┘     │   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Mobile Framework** | React Native + Expo (managed) | Expo SDK 54, RN 0.81.5 |
| **Language** | TypeScript (strict mode) | 5.9.2 |
| **Navigation** | expo-router | 6.0.23 |
| **State (Client)** | Zustand | 5.0.13 |
| **State (Server)** | TanStack Query | 5.100.10 |
| **Animations** | react-native-reanimated | 4.1.1 |
| **Backend** | Supabase (hosted) | Platform |
| **Database** | PostgreSQL | 15+ (Supabase managed) |
| **Authentication** | Supabase Auth (GoTrue) | Built-in |
| **Storage** | Supabase Storage (S3-compatible) | Built-in |
| **Real-Time** | Supabase Realtime (WebSocket) | Built-in |
| **Typography** | Inter (Google Fonts) | 0.4.2 |
| **Build System** | EAS Build | Cloud |

---

## 4. Module Interaction Diagram

```
CUSTOMER FLOW:
Login → Dashboard → Book Repair → Track Status → View Invoice → Pay

TECHNICIAN FLOW:
Login → HUD Dashboard → Receive Job → Diagnose → [Path A: On-Spot Fix | Path B: Shop Repair] → Build Invoice → Lock & Send

TENANT FLOW:
Login → Analytics Dashboard → Manage Technicians → View All Jobs → Assign Technicians

CROSS-CUTTING:
Auth Service ←→ All Flows (session, RBAC)
Audit Service ←→ All Mutations (logging)
Analytics Service ←→ Dashboard Aggregations
```

---

## 5. Data Flow — Job Lifecycle

```
1. Customer submits booking form
   └→ jobService.createJob() → INSERT jobs → auditService.log('job.created')

2. Tenant assigns technician
   └→ jobService.assignTechnician() → UPDATE jobs.technician_id → auditService.log('job.assigned')
   └→ Job status: PENDING → ASSIGNED

3. Technician starts travel
   └→ jobService.updateStatus('en_route') → auditService.log('job.status_changed')

4. Technician arrives, inspects device
   └→ jobService.updateStatus('diagnosing')

5. Technician selects repair path
   ├→ PATH A: On-Spot Fix
   │  └→ jobService.updateStatus('repairing')
   │  └→ invoiceService.createInvoice(jobId)
   │  └→ invoiceService.addLineItem(...)
   │  └→ invoiceService.lockInvoice(paymentMethod)
   │  └→ jobService.updateStatus('completed')
   │
   └→ PATH B: Shop Repair
      └→ receivingNoteService.create(jobId, condition, photos, signature)
      └→ jobService.updateStatus('repairing')
      └→ [Device taken to shop, repaired]
      └→ invoiceService.createInvoice(jobId)
      └→ invoiceService.addLineItem(...)
      └→ invoiceService.lockInvoice(paymentMethod)
      └→ jobService.updateStatus('completed')
```

---

## 6. Security Architecture

### Authentication
- Supabase Auth (GoTrue) issues JWTs on sign-in
- Tokens persisted securely on device (`persistSession: true`)
- Auto-refresh prevents session expiry during active use
- `onAuthStateChange` listener restores session on app restart

### Authorization (RBAC)
- 4 roles: `super_admin`, `tenant`, `technician`, `customer`
- Enforced at 3 layers: Database (RLS), Navigation (Route Groups), UI (Conditional Rendering)

### Row-Level Security
- Every table has RLS enabled
- Policies check `auth.uid()` against ownership/tenant membership
- `service_role` key never exposed to client

### Data Protection
- All communication over HTTPS/TLS
- Passwords hashed with bcrypt by Supabase Auth
- Soft deletes preserve data integrity
- Audit trail logs all mutations

---

## 7. Deployment Architecture

```
LOCAL (Development)
├── Expo Dev Server (npx expo start)
├── iOS Simulator / Android Emulator
└── Supabase Project (shared dev instance)

STAGING (Demo)
├── EAS Build (preview profile)
├── Internal APK distribution
└── Supabase Project (staging instance)

PRODUCTION
├── EAS Build (production profile)
├── Apple App Store / Google Play Store
└── Supabase Project (production instance)
```

### Environment Separation
- `.env` — Local development configuration
- `.env.example` — Template for onboarding (no secrets)
- EAS environment variables — Staging/Production secrets
- Supabase dashboard — Per-environment project configuration

---

## 8. Error Handling Strategy

All service methods return a standardized response envelope:

```typescript
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors: string[];
}
```

### Error Categories
| Category | Handling |
|----------|---------|
| Network failure | TanStack Query retry (2 attempts), offline fallback |
| Auth expired | Auto-refresh token, re-authenticate if refresh fails |
| RLS violation | Return error message, log to audit |
| Validation error | Client-side validation prevents most, server returns `errors[]` |
| Server error (500) | Display generic error, log to audit, retry |

---

## 9. Scalability Considerations

| Dimension | Current | Scale Path |
|-----------|---------|-----------|
| Users | <1,000 | Supabase handles 50K MAU on free tier |
| Data | <10 GB | Supabase scales storage automatically |
| Concurrent connections | <100 | Supabase pooler handles thousands |
| Geographic distribution | Single region | Supabase Edge Functions for multi-region |
| Build distribution | EAS Cloud | Automated CI/CD via GitHub Actions |

---

## 10. Related Documents

| Document | Location |
|----------|----------|
| Architecture Decision Records | `docs/adr/` |
| Database Schema | `docs/database-schema.md` |
| API Reference | `docs/api-reference.md` |
| DevOps & Deployment SOP | `docs/deployment-sop.md` |
| SaaS Blueprint | `instructions/mobile_repair_saas_blueprint.md` |
| Master Guidelines | `instructions/master_guidelines.md` |
