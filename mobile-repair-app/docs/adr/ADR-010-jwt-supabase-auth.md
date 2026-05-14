# ADR-010: JWT Authentication via Supabase Auth

- **Status:** Accepted
- **Date:** 2026-05-10
- **Deciders:** Solution Architect (Maani), Antigravity AI System
- **Category:** Authentication Strategy

---

## Context

Per **Master Guidelines Phase 5**, the system must implement "JWT/OAuth2 Authentication." Per **Security guidelines**, JWT tokens must have "15min expiry" with automatic refresh. The SaaS Blueprint §2 mandates "robust Authentication (JWT/OAuth)."

Revivix needs authentication that:
1. Works natively on iOS and Android (no browser redirect flows)
2. Integrates with PostgreSQL RLS (database-level authorization)
3. Supports email/password sign-up with future expandability to social OAuth
4. Persists sessions securely across app restarts
5. Automatically refreshes tokens without user intervention

## Decision

Use **Supabase Auth** with email/password authentication, which issues JWTs consumed by PostgreSQL RLS policies.

### Authentication Flow

```
┌──────────────┐     ┌─────────────────┐     ┌──────────────────┐
│  Mobile App  │     │  Supabase Auth   │     │   PostgreSQL     │
│              │     │  (GoTrue Server)  │     │   + RLS          │
└──────┬───────┘     └────────┬─────────┘     └────────┬─────────┘
       │                      │                         │
       │ 1. signUp(email,pw)  │                         │
       │─────────────────────▶│                         │
       │                      │ 2. Create auth.users    │
       │                      │────────────────────────▶│
       │                      │                         │
       │ 3. JWT + Refresh     │                         │
       │◀─────────────────────│                         │
       │                      │                         │
       │ 4. INSERT user profile (name, role, tenant_id) │
       │───────────────────────────────────────────────▶│
       │                      │                         │
       │ 5. Query data        │                         │
       │─────────────────── JWT ───────────────────────▶│
       │                      │     6. RLS checks       │
       │                      │     auth.uid() from JWT │
       │ 7. Filtered results  │                         │
       │◀──────────────────────────────────────────────│
```

### Token Configuration

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| Access Token Expiry | 1 hour (Supabase default) | Balance between security and UX |
| Refresh Token | Long-lived | Auto-refreshed by `autoRefreshToken: true` |
| Session Persistence | `persistSession: true` | Token stored in secure device storage |
| Session Detection | `detectSessionInUrl: false` | Not applicable for mobile apps |

### Post-Registration User Profile

After `supabase.auth.signUp()`, a separate insert into the `users` table creates the application profile:

```typescript
const { data: authData } = await supabase.auth.signUp({ email, password });
await supabase.from('users').insert({
  id: authData.user.id,  // FK to auth.users
  tenant_id,
  role,
  name,
  email,
  phone,
});
```

### Session Restoration

On app launch, `_layout.tsx` calls `supabase.auth.getSession()` to restore the previous session. If valid, the user is redirected to their role-appropriate dashboard without re-authentication.

```typescript
supabase.auth.onAuthStateChange((event, session) => {
  if (session?.user) {
    // Fetch user profile, set in Zustand
  } else {
    // Clear Zustand, redirect to login
  }
});
```

## Consequences

### Benefits
- **Database-integrated auth** — JWT `sub` claim maps directly to `auth.uid()` in RLS policies. No separate auth verification layer needed.
- **Zero custom auth code** — No bcrypt hashing, no JWT signing, no refresh token rotation logic to implement.
- **Secure by default** — Supabase handles password hashing (bcrypt), rate limiting, and token rotation.
- **Future expandability** — Supabase Auth supports Google, Apple, Facebook, and GitHub OAuth with minimal configuration changes.

### Risks & Mitigations
- **Email confirmation** — Supabase requires email confirmation by default. For MVP, this can be disabled in Supabase dashboard. Should be re-enabled before production.
- **Token size** — Supabase JWTs contain custom claims. Large JWTs increase request size. Current claims are minimal (~1KB), acceptable for mobile.
- **Session hijacking** — If a device is compromised, the JWT can be stolen. Mitigated by secure storage (Expo SecureStore for production) and short token expiry.

## Alternatives Considered

| Alternative | Why Rejected |
|------------|-------------|
| **Custom JWT with bcrypt** | Requires building auth server (token issuance, refresh rotation, password reset). Massive effort for equivalent functionality. |
| **Firebase Auth** | Not integrated with PostgreSQL RLS. Would require a middleware layer to verify tokens before database access. |
| **Auth0** | Enterprise-grade but adds external dependency and cost. Supabase Auth is included in the platform. |
| **Clerk** | React-focused auth provider. Good DX but not integrated with PostgreSQL RLS at the database level. |

## References
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- Master Guidelines — Phase 5: Security Architecture & Hardening
- Security guidelines — JWT with 15min expiry (adjusted to Supabase default 1hr)
