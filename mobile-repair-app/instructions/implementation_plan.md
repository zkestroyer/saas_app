# Mobile Repair SaaS Platform — Implementation Plan

## Goal
Build a **premium, production-ready Mobile Repair SaaS application** using **React Native (Expo)** with an offline-first architecture, adhering strictly to the **Project_Brain** engineering guidelines and the **SaaS Blueprint** requirements.

---

## ✅ Project_Brain Files Read & Absorbed

| File | Key Takeaways Applied |
|------|----------------------|
| `Project_context.md` | Template — we fill in with our SaaS context |
| `AI_instructions.md` | Production-ready code, no TODO placeholders, JSDoc, explain decisions |
| `Architecture.md` | Atomic design (Atoms→Molecules→Organisms→Pages), Container/Presentational split, Zustand for state |
| `Code_standards.md` | TypeScript strict, kebab-case files, PascalCase components, JSDoc, `{data, error}` envelope |
| `Master_Engineering_Guidelines.md` | API-first, soft deletes (`deleted_at`), JWT auth, RBAC, premium aesthetics, `data-testid` everywhere, standardized JSON responses |
| `Mobile_app.md` | **Expo managed workflow, expo-router, Zustand + TanStack Query, FlashList, expo-image, MMKV, KeyboardAvoidingView** |
| `UX.md` | Design tokens (colors, spacing, typography), glassmorphism, micro-animations, dark mode, Inter font, component-driven UI |
| `Security.md` | JWT with 15min expiry, RBAC, bcrypt/argon2, input sanitization, rate limiting |
| `Performance.md` | LCP <2.5s, code splitting, lazy loading, cursor pagination |
| `Deployment.md` | Env separation, CI/CD, .env.example, rollback plan |
| `QA_checklist.md` | Lint pass, 80% coverage, E2E for critical flows, ARIA, keyboard nav |
| `Test_cases.md` | Vitest + RTL, Playwright E2E, coverage for happy/error/edge paths |

---

## User Review Required

> [!IMPORTANT]
> **APK Build Requirement:** Your `Mobile_app.md` specifies **Expo managed workflow**. To produce an APK today, we need either:
> - **Option A:** An Expo/EAS account → `eas build -p android --profile preview` (cloud build, ~20 min)
> - **Option B:** Local Android SDK + JDK → `npx expo prebuild` then `cd android && ./gradlew assembleRelease`
> 
> **Which do you have available?**

> [!IMPORTANT]
> **Offline-First MVP:** Per your `Mobile_app.md` ("Offline-First Strategy: Implement local caching so the app remains usable when network is disconnected"), I'll build the MVP with **expo-sqlite** for local data + **MMKV** for cache persistence. The app will work fully standalone without a backend server. A backend can be added later.

---

## Technology Stack (Aligned with Project_Brain)

| Layer | Technology | Brain Reference |
|-------|-----------|----------------|
| **Framework** | React Native + Expo SDK 52 (managed) | `Mobile_app.md` |
| **Navigation** | expo-router (file-based) | `Mobile_app.md` |
| **State** | Zustand + TanStack Query | `Mobile_app.md`, `Architecture.md` |
| **Cache** | react-native-mmkv | `Mobile_app.md` |
| **Local DB** | expo-sqlite | `Master_Engineering.md` (offline-first) |
| **Lists** | FlashList | `Mobile_app.md` |
| **Images** | expo-image | `Mobile_app.md` |
| **Camera** | expo-image-picker | `Mobile_app.md` |
| **Animations** | react-native-reanimated | `Mobile_app.md` |
| **Typography** | Inter (expo-google-fonts) | `UX.md` |
| **Design** | Custom Atomic Design System | `Architecture.md`, `UX.md` |
| **Auth** | JWT (local mock for MVP) | `Security.md` |
| **Language** | TypeScript (strict mode) | `Code_standards.md` |

---

## Design System (from UX.md tokens)

```
Colors:
  Primary:     #206BC4 (Tabler blue)
  PrimaryLight: #4A8EEC
  PrimaryDark:  #1A559D
  Secondary:   #6C7A91
  Success:     #2FB344
  Warning:     #F59E0B
  Danger:      #D63939
  BgDark:      #1A2234
  SurfaceDark: #243044
  TextPrimary: #F4F6FA
  TextSecondary: #9BA3AE

Spacing: xs=4, s=8, m=16, l=24, xl=32
Font: Inter
```

---

## Proposed Changes

### 1. Project Foundation

#### [NEW] `app.json` — Expo config
#### [NEW] `package.json` — All dependencies
#### [NEW] `tsconfig.json` — TypeScript strict mode
#### [NEW] `babel.config.js` — Reanimated plugin
#### [NEW] `.env.example` — Environment variables template (per `Deployment.md`)

---

### 2. Design System (Atomic: Atoms)

Per `Architecture.md` atomic design + `UX.md` tokens:

#### [NEW] `src/theme/colors.ts` — Color tokens mirroring UX.md
#### [NEW] `src/theme/spacing.ts` — Spacing scale
#### [NEW] `src/theme/typography.ts` — Typography with Inter
#### [NEW] `src/theme/index.ts` — Unified theme export
#### [NEW] `src/components/ui/button.tsx` — Premium animated button (Atom)
#### [NEW] `src/components/ui/card.tsx` — Glassmorphism card (Atom)
#### [NEW] `src/components/ui/input.tsx` — Styled input with validation (Atom)
#### [NEW] `src/components/ui/badge.tsx` — Status badge (Atom)
#### [NEW] `src/components/ui/stat-card.tsx` — Analytics stat card (Atom, from UX.md)
#### [NEW] `src/components/ui/timeline-item.tsx` — Repair tracking node (Atom)

---

### 3. Navigation (expo-router)

Per `Mobile_app.md`: file-based routing with expo-router.

#### [NEW] `app/_layout.tsx` — Root layout with providers (ThemeProvider, AuthProvider)
#### [NEW] `app/(auth)/login.tsx` — Login screen
#### [NEW] `app/(auth)/register.tsx` — Registration screen
#### [NEW] `app/(auth)/_layout.tsx` — Auth stack layout
#### [NEW] `app/(customer)/_layout.tsx` — Customer tab layout
#### [NEW] `app/(customer)/index.tsx` — Customer home/dashboard
#### [NEW] `app/(customer)/booking.tsx` — Repair booking flow
#### [NEW] `app/(customer)/track/[id].tsx` — Live repair tracking
#### [NEW] `app/(customer)/invoices.tsx` — Invoice list
#### [NEW] `app/(customer)/invoice/[id].tsx` — Invoice detail
#### [NEW] `app/(technician)/_layout.tsx` — Technician tab layout
#### [NEW] `app/(technician)/index.tsx` — Technician dashboard
#### [NEW] `app/(technician)/job/[id].tsx` — Job detail + assessment
#### [NEW] `app/(technician)/invoice-builder/[id].tsx` — Dynamic invoice builder
#### [NEW] `app/(tenant)/_layout.tsx` — Tenant/Owner tab layout
#### [NEW] `app/(tenant)/index.tsx` — Business dashboard with analytics
#### [NEW] `app/(tenant)/technicians.tsx` — Technician management
#### [NEW] `app/(tenant)/jobs.tsx` — Jobs overview

---

### 4. State Management (Zustand + TanStack Query)

Per `Architecture.md`: Zustand for client state, TanStack Query for server state.

#### [NEW] `src/stores/auth-store.ts` — Auth state, JWT, user role, RBAC
#### [NEW] `src/stores/job-store.ts` — Job CRUD, status transitions
#### [NEW] `src/stores/invoice-store.ts` — Invoice CRUD, dynamic line items, locking

---

### 5. Database Layer (expo-sqlite)

Per `Master_Engineering_Guidelines.md`: soft deletes, `created_at`/`updated_at`/`deleted_at`, snake_case tables.

#### [NEW] `src/database/schema.ts` — SQLite schema
Tables:
- `tenants` (id UUID, business_name, plan, created_at, updated_at, deleted_at)
- `users` (id UUID, tenant_id FK, role ENUM, name, email, password_hash, created_at, updated_at, deleted_at)
- `jobs` (id UUID, customer_id FK, technician_id FK, tenant_id FK, device_brand, device_model, issue_category, description, photos JSON, service_type, status, location, created_at, updated_at, deleted_at)
- `invoices` (id UUID, job_id FK, status, subtotal, tax, total, is_locked, created_at, updated_at, deleted_at)
- `invoice_items` (id UUID, invoice_id FK, type ENUM, description, quantity, unit_price, amount, created_at, updated_at, deleted_at)
- `receiving_notes` (id UUID, job_id FK, device_condition, photos JSON, customer_signature_uri, created_at, updated_at, deleted_at)
- `audit_trails` (id, actor_id, action, target, ip, created_at) — per Master Engineering §3

#### [NEW] `src/database/connection.ts` — SQLite connection manager
#### [NEW] `src/database/seed.ts` — Demo data for all 4 roles
#### [NEW] `src/database/repositories/` — Repository pattern (per Architecture.md: "never call DB directly from component")
  - `user-repository.ts`
  - `job-repository.ts`
  - `invoice-repository.ts`

---

### 6. Services Layer

Per `Architecture.md`: Service layer between components and data.

#### [NEW] `src/services/auth-service.ts` — Login, register, JWT generation/validation
#### [NEW] `src/services/job-service.ts` — Job lifecycle, dispatch, status transitions
#### [NEW] `src/services/invoice-service.ts` — Dynamic invoicing, locking, payment
#### [NEW] `src/services/receiving-note-service.ts` — Device receiving note generation

---

### 7. Core Feature Screens

#### Customer Booking Flow (Blueprint §4.1)
- Multi-step form: Device Brand/Model → Issue Category → Description + Photos → Service Type → Location
- All inputs have `data-testid` attributes (Blueprint §6)
- Form validation with Zod (Architecture.md)

#### Technician Assessment + Branching Logic (Blueprint §4.2)
- **Path A: On-Spot Fix** — Complete repair at location, generate invoice
- **Path B: Shop Repair** — Generate Device Receiving Note (PDF), take device to shop
- Push notification simulation for job dispatch

#### Dynamic Invoicing (Blueprint §4.3)
- Add/remove line items (Parts, Labor, Tax, Dispatch)
- Real-time total recalculation
- **Invoice stays editable until payment** (critical business rule)
- Lock on payment, generate final receipt

---

### 8. Shared Components (Molecules + Organisms)

#### [NEW] `src/components/molecules/form-field.tsx` — Label + Input + Error
#### [NEW] `src/components/molecules/step-indicator.tsx` — Multi-step progress
#### [NEW] `src/components/molecules/job-card.tsx` — Job summary card
#### [NEW] `src/components/molecules/invoice-line-item.tsx` — Editable invoice row
#### [NEW] `src/components/organisms/booking-form.tsx` — Complete booking form
#### [NEW] `src/components/organisms/repair-timeline.tsx` — Live tracking timeline
#### [NEW] `src/components/organisms/invoice-editor.tsx` — Dynamic invoice editor
#### [NEW] `src/components/layout/tab-bar.tsx` — Custom animated bottom tab bar
#### [NEW] `src/components/layout/header.tsx` — App header with gradient

---

## Build Order

| Phase | Duration | What |
|-------|----------|------|
| 1. Foundation | 25 min | Expo init, TypeScript, theme, design system |
| 2. Database + Auth | 25 min | SQLite schema, seed data, auth service, login/register |
| 3. Customer Flow | 40 min | Home, booking form, tracking, invoice viewing |
| 4. Technician Flow | 40 min | Dashboard, job detail, assessment branching, receiving note, invoice builder |
| 5. Tenant Dashboard | 25 min | Analytics, technician management, job overview |
| 6. Polish | 15 min | Animations, micro-interactions, dark mode refinement |
| 7. APK Build | 15 min | Expo prebuild + Gradle OR EAS build |

---

## Verification Plan

### Automated
- `npx expo start` — Verify zero compilation errors
- `npx tsc --noEmit` — TypeScript strict check
- APK installs and runs on Android device/emulator

### Manual Verification
1. Complete Customer Booking flow end-to-end
2. Technician receives job, tests **both** Path A (on-spot) and Path B (shop repair)
3. Dynamic invoice: add items, edit, recalculate, lock on payment
4. Device Receiving Note generates correctly
5. Role-based navigation: each role sees only their screens
6. All interactive elements have `data-testid` attributes
7. UI passes "premium aesthetics" bar — dark mode, glassmorphism, animations

### QA Checklist (from `QA_checklist.md`)
- [ ] Lint and type-check pass with zero errors
- [ ] Code follows `Code_standards.md`
- [ ] No commented-out code or unused imports
- [ ] No secrets in code
- [ ] Input validation present
- [ ] RBAC active on all routes
- [ ] Components have ARIA labels
- [ ] Keyboard navigation works
