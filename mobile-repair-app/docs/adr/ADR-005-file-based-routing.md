# ADR-005: File-Based Routing with Expo Router

- **Status:** Accepted
- **Date:** 2026-05-10
- **Deciders:** Solution Architect (Maani), Antigravity AI System
- **Category:** Navigation Architecture

---

## Context

Revivix has a complex navigation structure with 4 distinct role-based route groups, each containing multiple screens with nested dynamic routes (e.g., `job/[id]`, `invoice/[id]`, `track/[id]`).

The navigation must enforce RBAC — customers should never access technician screens and vice versa. Per the implementation plan (`Mobile_app.md`), the framework mandates "expo-router" for file-based routing.

## Decision

Use **Expo Router v6** with file-based routing organized into role-scoped route groups.

### Route Structure

```
app/
├── _layout.tsx                  # Root — providers, fonts, splash
├── index.tsx                    # Entry — role-based redirect
├── (auth)/
│   ├── _layout.tsx              # Auth stack
│   ├── login.tsx                # Login screen
│   └── register.tsx             # Registration screen
├── (customer)/
│   ├── _layout.tsx              # Customer tab bar
│   ├── index.tsx                # Customer dashboard
│   ├── booking.tsx              # Multi-step booking form
│   ├── invoices.tsx             # Invoice list
│   ├── profile.tsx              # Profile & settings
│   └── track/[id].tsx           # Live repair tracking
├── (technician)/
│   ├── _layout.tsx              # Technician tab bar
│   ├── index.tsx                # Tech HUD dashboard
│   ├── profile.tsx              # Profile & settings
│   ├── job/[id].tsx             # Job detail + assessment
│   └── invoice/[id].tsx         # Dynamic invoice builder
└── (tenant)/
    ├── _layout.tsx              # Tenant tab bar
    ├── index.tsx                # Business analytics dashboard
    ├── technicians.tsx          # Technician management
    ├── jobs.tsx                 # All jobs overview
    └── profile.tsx              # Profile & settings
```

### Route Group Semantics

- `(auth)` — Stack navigator, no tab bar, shown when unauthenticated
- `(customer)` — Bottom tab navigator with Home, Booking, Invoices, Profile
- `(technician)` — Bottom tab navigator with Dashboard, Profile
- `(tenant)` — Bottom tab navigator with Dashboard, Technicians, Jobs, Profile

The root `index.tsx` inspects `useAuthStore().user?.role` and redirects to the appropriate group via `router.replace()`.

## Consequences

### Benefits
- **Convention over configuration** — Routes are defined by file path, not manual registration. Adding a new screen is creating a file.
- **Deep linking for free** — Every route is automatically a deep-linkable URL, critical for push notification navigation (e.g., "Job #123 has been assigned" → opens `/(technician)/job/123`).
- **Role isolation** — Route groups naturally enforce separation. Customers navigate within `(customer)/` and never enter `(technician)/` routes.
- **SEO for web** — If the app is ever served as a web app (Expo supports this), file-based routes map directly to URL paths.

### Risks & Mitigations
- **Route group explosion** — As roles grow, the number of route groups increases. Mitigated by shared components/layouts across groups.
- **Dynamic route complexity** — Deeply nested dynamic routes (`job/[id]/assessment/[step]`) can become hard to reason about. Mitigated by keeping nesting to 2 levels maximum.

## Alternatives Considered

| Alternative | Why Rejected |
|------------|-------------|
| **React Navigation (imperative)** | Manual route registration via `createStackNavigator()`, `createBottomTabNavigator()`. More boilerplate, no file-based convention. |
| **React Navigation + TypeScript config** | Better type safety than imperative but still requires manual route configuration. Expo Router provides equivalent type safety via `useLocalSearchParams<T>()`. |

## References
- [Expo Router Documentation](https://docs.expo.dev/router/introduction/)
- Implementation Plan — §3: Navigation
