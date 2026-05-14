# ADR-001: Use Supabase as Backend-as-a-Service (BaaS)

- **Status:** Accepted
- **Date:** 2026-05-10
- **Deciders:** Solution Architect (Maani), Antigravity AI System
- **Category:** Backend Platform

---

## Context

The Revivix Mobile Repair SaaS platform requires a backend infrastructure capable of:

1. **Authentication & Authorization** — Secure user sign-up/sign-in with JWT tokens and role-based access control across 4 distinct user roles (Super Admin, Tenant, Technician, Customer).
2. **Relational Database** — PostgreSQL for complex multi-tenant data relationships (jobs → invoices → line items → receiving notes) with ACID transactions.
3. **Row-Level Security (RLS)** — Native database-level data isolation to enforce multi-tenancy without application-layer filtering.
4. **Real-Time Subscriptions** — Live job status updates for customers tracking their repairs.
5. **File Storage** — Secure upload/retrieval of device damage photos and digital signatures.
6. **Rapid Development** — The team requires a platform that minimizes boilerplate and accelerates time-to-market.

Per **Master Guidelines Phase 2 (Tech Stack Matrix)**, the project falls under the "Mobile Applications" class, requiring decoupled RESTful APIs and a managed database engine. Per **Phase 5 (Security)**, JWT/OAuth2 authentication and strict RBAC are mandatory.

## Decision

Adopt **Supabase** (hosted PostgreSQL + Auth + Storage + Realtime) as the primary backend platform for Revivix.

### Key Technical Rationale

| Requirement | Supabase Capability |
|------------|-------------------|
| PostgreSQL with RLS | ✅ Native — Supabase is built on PostgreSQL with first-class RLS support |
| JWT Authentication | ✅ Built-in `supabase.auth` with JWT issuance, refresh tokens, and session management |
| Role-Based Access | ✅ RLS policies can inspect `auth.uid()` and join to a `users.role` column |
| Real-Time | ✅ `supabase.channel()` for live job status subscriptions |
| File Storage | ✅ `supabase.storage` with bucket-level policies |
| API Generation | ✅ Auto-generated REST (PostgREST) and GraphQL APIs from schema |
| Client SDK | ✅ `@supabase/supabase-js` with TypeScript types |

### Configuration

```
EXPO_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon_key>
```

The client is initialized with `persistSession: true` and `autoRefreshToken: true` for seamless mobile session management.

## Consequences

### Benefits
- **Zero server management** — No Node.js/Express server to maintain, deploy, or scale. Per Master Guidelines Phase 8, this eliminates the need for PM2, Rsync, and SSH deployment scripts for the data layer.
- **Built-in security** — RLS enforces data isolation at the database level, not in application code. Even a compromised API key cannot bypass RLS policies.
- **Rapid iteration** — Schema changes are applied via SQL editor; no ORM migration tooling required.
- **Cost-effective for MVP** — Free tier supports up to 500MB database, 1GB storage, and 50,000 monthly active users.

### Risks & Mitigations
- **Vendor lock-in** — Supabase is open-source and self-hostable. If cost or control becomes an issue, the entire stack can be migrated to a self-hosted PostgreSQL instance.
- **Complex queries** — Some aggregation queries (e.g., tenant analytics) may require Supabase Edge Functions or PostgreSQL functions rather than simple client SDK calls.
- **Latency** — Mobile clients make direct HTTPS calls to Supabase. Geographic distance from the Supabase region could introduce latency. Mitigated by selecting a region close to the primary user base.

## Alternatives Considered

| Alternative | Why Rejected |
|------------|-------------|
| **Firebase (Firestore)** | NoSQL document model poorly suited for relational data (jobs→invoices→items). No native RLS equivalent; security rules are less expressive. |
| **Custom Node.js + Express + PostgreSQL** | Per Master Guidelines Phase 2, this is valid for Enterprise SaaS. However, it requires significant boilerplate (auth, middleware, deployment) that Supabase provides out-of-the-box. Rejected for MVP velocity. May be revisited for V2 if complex business logic requires server-side processing. |
| **AWS Amplify** | Heavier operational overhead, less transparent pricing, and GraphQL-centric approach adds complexity for a team standardized on REST. |
| **Appwrite** | Younger ecosystem, fewer client SDK features (e.g., no native RLS), and smaller community for troubleshooting. |

## References
- [Supabase Documentation](https://supabase.com/docs)
- Master Guidelines — Phase 2: Solution Architecture & Tech Stack Matrix
- Master Guidelines — Phase 5: Security Architecture & Hardening
- Project Onboarding Questionnaire — Part B: Technical Architecture Checklist
