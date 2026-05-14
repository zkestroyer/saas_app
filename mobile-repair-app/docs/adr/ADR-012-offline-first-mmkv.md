# ADR-012: Offline-First Strategy with MMKV Caching

- **Status:** Accepted
- **Date:** 2026-05-10
- **Deciders:** Solution Architect (Maani), Antigravity AI System
- **Category:** Connectivity & Caching

---

## Context

Per the implementation plan (`Mobile_app.md`): "Offline-First Strategy: Implement local caching so the app remains usable when network is disconnected." Technicians operate in the field where network connectivity is unreliable — basements, rural areas, and buildings with poor signal. Critical workflows (viewing assigned jobs, starting repairs) must function without network access.

Per **Master Guidelines Phase 4**, the system requires "offline-first caching capabilities."

## Decision

Implement a **cache-first offline strategy** using **react-native-mmkv** for persistent key-value storage combined with **TanStack Query's** built-in cache layer.

### Architecture

```
┌─────────────────────────────────────────────────┐
│                 React Component                  │
│          useQuery(['jobs', userId])              │
└──────────────────────┬──────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────┐
│              TanStack Query Cache                │
│                                                  │
│  1. Check in-memory cache (staleTime: 5min)     │
│  2. If stale → background refetch from network  │
│  3. If offline → return cached data             │
└──────────────────────┬──────────────────────────┘
                       │ (persisted to)
                       ▼
┌─────────────────────────────────────────────────┐
│                    MMKV                          │
│          (Persistent key-value store)            │
│                                                  │
│  • Synchronous reads (0ms vs AsyncStorage ~5ms) │
│  • Written in C++ (JSI, no bridge overhead)     │
│  • Encrypted at rest                            │
│  • Survives app restarts                        │
└─────────────────────────────────────────────────┘
```

### Caching Strategy by Data Type

| Data | Cache Duration | Offline Behavior |
|------|---------------|-----------------|
| Auth session | Persistent | Full offline access |
| User profile | 30 minutes | Show cached profile |
| Job list | 5 minutes | Show last-known jobs |
| Job detail | 5 minutes | Show cached detail |
| Invoice data | 2 minutes | Show cached invoice |
| Analytics | 15 minutes | Show stale analytics |
| Theme/preferences | Persistent | Always available |

### Offline Mutation Queue (Future Enhancement)

For V2, mutations made while offline (e.g., technician updates job status) will be queued in MMKV and replayed when connectivity returns. Current MVP requires connectivity for mutations.

## Consequences

### Benefits
- **Instant app startup** — Cached data loads synchronously from MMKV while network request fires in background.
- **Field reliability** — Technicians can view their assigned jobs even in areas with poor connectivity.
- **Performance** — MMKV reads are ~30x faster than AsyncStorage (synchronous C++ vs. async bridge).
- **User trust** — The app never shows a blank screen due to network issues; it always has something to display.

### Risks & Mitigations
- **Stale data** — Users may see outdated information. Mitigated by showing "Last updated: X minutes ago" indicators and pull-to-refresh.
- **Offline mutations** — Creating jobs or locking invoices requires network. Mitigated by clear "No connection" UI feedback for write operations.
- **Cache invalidation** — MMKV cache can become inconsistent with server. Mitigated by TanStack Query's automatic background refetching on reconnection.

## Alternatives Considered

| Alternative | Why Rejected |
|------------|-------------|
| **AsyncStorage** | React Native's default. Asynchronous, JSON-only, slower than MMKV. No encryption. |
| **WatermelonDB** | Full offline-first database with sync engine. Powerful but heavy — adds significant complexity for current requirements. May be adopted in V2. |
| **expo-sqlite for caching** | SQLite is overkill for key-value cache storage. Better suited for relational offline data (if we move away from Supabase). |

## References
- [react-native-mmkv](https://github.com/mrousavy/react-native-mmkv)
- [TanStack Query Persistence](https://tanstack.com/query/latest/docs/framework/react/plugins/persistQueryClient)
- Master Guidelines — Phase 4: Core Software Engineering (offline-first)
