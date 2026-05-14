# ADR-004: Zustand + TanStack Query for State Management

- **Status:** Accepted
- **Date:** 2026-05-10
- **Deciders:** Solution Architect (Maani), Antigravity AI System
- **Category:** Client-Side Architecture

---

## Context

The Revivix mobile application requires two distinct categories of state:

1. **Client State** — UI state, form data, theme preferences, auth session. This data originates on the device and does not require server synchronization.
2. **Server State** — Jobs, invoices, user profiles, analytics. This data lives in Supabase and must be fetched, cached, invalidated, and mutated with proper loading/error handling.

Per **Master Guidelines Phase 4**, the system must use "robust data handling (Redux, Zustand, Flutter Provider/Bloc) with offline-first caching capabilities." The implementation plan specifies "Zustand + TanStack Query" per `Mobile_app.md`.

## Decision

Adopt a **dual-library architecture**:
- **Zustand v5** for client-only state (auth session, theme, UI flags)
- **TanStack Query v5** for server state (all Supabase data fetching/mutation)

### Architecture

```
┌─────────────────────────────────────────────────────┐
│                   React Components                   │
│                                                      │
│  useAuthStore()     useQuery('jobs', ...)            │
│  useThemeStore()    useMutation('createJob', ...)    │
│       │                      │                       │
│       ▼                      ▼                       │
│  ┌──────────┐     ┌──────────────────────┐          │
│  │  Zustand  │     │   TanStack Query     │          │
│  │ (Client)  │     │   (Server Cache)     │          │
│  │           │     │                      │          │
│  │ • auth    │     │ • jobs[]             │          │
│  │ • theme   │     │ • invoices[]         │          │
│  │ • UI      │     │ • technicians[]      │          │
│  └──────────┘     │ • analytics          │          │
│                    └──────────┬───────────┘          │
│                               │                      │
│                               ▼                      │
│                    ┌──────────────────────┐          │
│                    │   Supabase Client     │          │
│                    └──────────────────────┘          │
└─────────────────────────────────────────────────────┘
```

### Store Structure

| Store | Library | Contents |
|-------|---------|----------|
| `auth-store.ts` | Zustand | `user`, `isAuthenticated`, `isLoading`, `session` |
| `theme-store.ts` | Zustand | `role` (customer/technician/tenant), theme switching |
| `invoice-store.ts` | Zustand | Active invoice editing session (local UI state) |
| Job queries | TanStack Query | `useQuery(['jobs', customerId])`, `useMutation(createJob)` |
| Invoice queries | TanStack Query | `useQuery(['invoices', jobId])`, `useMutation(lockInvoice)` |

### TanStack Query Configuration

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,  // 5 minutes
      retry: 2,
      refetchOnWindowFocus: false, // Mobile doesn't have window focus
    },
  },
});
```

## Consequences

### Benefits
- **Separation of concerns** — Client state never mixes with server cache. Each library excels at its specific job.
- **Automatic caching** — TanStack Query handles cache invalidation, background refetching, and optimistic updates without manual implementation.
- **Minimal boilerplate** — Zustand stores are ~15 lines of code vs. Redux's action/reducer/selector pattern (~50+ lines). Zero providers required.
- **DevTools** — Both libraries offer React DevTools integration for debugging.
- **Type-safe** — Both libraries have excellent TypeScript support with generic query keys and store types.

### Risks & Mitigations
- **Two libraries to learn** — Team must understand both Zustand and TanStack Query patterns. Mitigated by clear documentation and consistent store/query patterns.
- **Cache coherency** — If Zustand and TanStack Query hold overlapping data, they can drift. Mitigated by strict rule: Zustand holds ONLY client state, TanStack Query holds ONLY server data.

## Alternatives Considered

| Alternative | Why Rejected |
|------------|-------------|
| **Redux Toolkit** | Higher boilerplate, steeper learning curve for small team. Redux Toolkit Query (RTK Query) is viable but less ergonomic than TanStack Query for Supabase integration. |
| **Zustand only** | Would require manual implementation of caching, background refetching, pagination, optimistic updates. TanStack Query provides all of this out-of-the-box. |
| **Jotai / Recoil** | Atom-based state management. More granular but harder to reason about for complex multi-screen state. Less community adoption in React Native ecosystem. |
| **MobX** | Observable-based. Good for complex derived state but adds runtime overhead and proxy-based magic that complicates debugging on mobile. |

## References
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [TanStack Query Documentation](https://tanstack.com/query/latest)
- Master Guidelines — Phase 4: Core Software Engineering
- Implementation Plan — §4: State Management
