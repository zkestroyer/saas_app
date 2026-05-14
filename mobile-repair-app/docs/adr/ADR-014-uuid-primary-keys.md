# ADR-014: UUID Primary Keys for All Entities

- **Status:** Accepted
- **Date:** 2026-05-10
- **Deciders:** Solution Architect (Maani), Antigravity AI System
- **Category:** Data Modeling — ID Generation

---

## Context

Every table in the Revivix schema needs a primary key strategy. The choice between auto-incrementing integers and UUIDs has implications for security, scalability, multi-tenancy, and client-side record creation.

Per the implementation plan, the schema uses "id UUID PRIMARY KEY DEFAULT uuid_generate_v4()" on all tables. This decision documents the rationale.

## Decision

Use **UUID v4** as the primary key for all database tables, generated server-side by PostgreSQL's `uuid_generate_v4()` function.

### Implementation

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Every table
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ...
);
```

### Client-Side UUID Generation

For offline-first scenarios where records may be created before network sync, the mobile app generates UUIDs using the `uuid` npm package:

```typescript
import { v4 as uuidv4 } from 'uuid';
const newJobId = uuidv4(); // e.g., '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d'
```

## Consequences

### Benefits
- **Security** — Auto-incrementing IDs leak information (e.g., "Job #1042" reveals there are 1042 jobs). UUIDs are opaque and unguessable.
- **Multi-tenant safety** — No ID collisions across tenants. Sequential IDs could expose cross-tenant record counts.
- **Offline creation** — Clients can generate valid IDs without server round-trips, enabling offline-first workflows.
- **Merge-safe** — UUID uniqueness is probabilistically guaranteed across databases, enabling future data migrations or sharding.
- **Supabase Auth alignment** — `auth.users.id` is UUID. Using UUIDs for application tables maintains FK consistency.

### Risks & Mitigations
- **Storage overhead** — UUIDs are 16 bytes vs. 4 bytes for integers. At current scale (~10K records), this is negligible. Mitigated by indexing strategy.
- **Index performance** — Random UUIDs cause B-tree index page splits. Mitigated by PostgreSQL's efficient UUID indexing and the relatively low record count for a SaaS MVP.
- **Readability** — UUIDs are harder to communicate verbally ("job 9b1deb4d..." vs. "job 1042"). Mitigated by using short display IDs (e.g., "J-101") in the UI while using UUIDs internally.

## Alternatives Considered

| Alternative | Why Rejected |
|------------|-------------|
| **Auto-incrementing INTEGER** | Leaks business intelligence, not safe for client-side generation, not merge-safe across tenants. |
| **UUID v7 (time-ordered)** | Better index locality but requires PostgreSQL 17+ or application-side generation. Not yet standardized in Supabase's `uuid-ossp` extension. May be adopted in V2. |
| **ULID** | Time-ordered, lexicographically sortable. Not natively supported by PostgreSQL. Would require application-side generation and `VARCHAR` storage. |
| **Snowflake IDs** | Twitter-style distributed IDs. Requires a coordination service. Over-engineered for current single-database architecture. |

## References
- [PostgreSQL UUID Documentation](https://www.postgresql.org/docs/current/datatype-uuid.html)
- [RFC 4122 — UUID URN Namespace](https://tools.ietf.org/html/rfc4122)
- Implementation Plan — §5: Database Layer
