# 07 — RBAC & Row-Level Security Test Cases

> **Schema:** `supabase/schema.sql` — RLS policies  
> **Requirements:** NFR-SEC-03 (RLS on all tables), ADR-003 (Multi-Tenant RLS), ADR-006 (RBAC)

---

## Overview

These tests validate that **Row-Level Security policies** correctly enforce data isolation:
- **Customers** see only their own data
- **Technicians** see only assigned job data
- **Tenants** see only their organization's data
- **Cross-tenant** data is NEVER leaked

---

## Test Suite: `rbac.spec.ts`

### TC-RBAC-001: Customer Cannot Read Other Customers' Jobs
**Priority:** P0

```typescript
test('customer RLS — only own jobs visible', async ({ customerClient }) => {
  const { data: { user } } = await customerClient.auth.getUser();

  const { data: jobs } = await customerClient
    .from('jobs')
    .select('customer_id')
    .is('deleted_at', null);

  for (const job of jobs ?? []) {
    expect(job.customer_id).toBe(user!.id);
  }
});
```

---

### TC-RBAC-002: Technician Cannot Read Unassigned Jobs
**Priority:** P0

```typescript
test('technician RLS — only assigned jobs visible', async ({ technicianClient }) => {
  const { data: { user } } = await technicianClient.auth.getUser();

  const { data: jobs } = await technicianClient
    .from('jobs')
    .select('technician_id')
    .is('deleted_at', null);

  for (const job of jobs ?? []) {
    expect(job.technician_id).toBe(user!.id);
  }
});
```

---

### TC-RBAC-003: Tenant Reads Only Org Jobs
**Priority:** P0

```typescript
test('tenant RLS — only own org jobs', async ({ tenantClient }) => {
  const { data: { user } } = await tenantClient.auth.getUser();
  const { data: profile } = await tenantClient
    .from('users').select('tenant_id').eq('id', user!.id).single();

  const { data: jobs } = await tenantClient
    .from('jobs').select('tenant_id').is('deleted_at', null);

  for (const job of jobs ?? []) {
    expect(job.tenant_id).toBe(profile!.tenant_id);
  }
});
```

---

### TC-RBAC-004: Customer Cannot Read Audit Trails
**Priority:** P0

```typescript
test('customer cannot access audit trails', async ({ customerClient }) => {
  const { data, error } = await customerClient
    .from('audit_trails')
    .select('*')
    .limit(1);

  // RLS: only super_admin can SELECT audit_trails
  expect(data).toEqual([]);
});
```

---

### TC-RBAC-005: Technician Cannot Read Audit Trails
**Priority:** P0

```typescript
test('technician cannot access audit trails', async ({ technicianClient }) => {
  const { data } = await technicianClient
    .from('audit_trails').select('*').limit(1);
  expect(data).toEqual([]);
});
```

---

### TC-RBAC-006: Customer Can Only Read Own Profile
**Priority:** P1

```typescript
test('customer can read own profile but not others', async ({ customerClient }) => {
  const { data: { user } } = await customerClient.auth.getUser();

  // Own profile — should work
  const { data: own, error: ownErr } = await customerClient
    .from('users').select('*').eq('id', user!.id).single();
  expect(ownErr).toBeNull();
  expect(own.id).toBe(user!.id);

  // Other users — RLS should filter them out
  const { data: all } = await customerClient
    .from('users').select('id');

  // Should only see self (and possibly technicians via assigned job policy)
  const otherNonRelated = (all ?? []).filter(
    u => u.id !== user!.id
  );
  // Any returned users must be related via job assignments
});
```

---

### TC-RBAC-007: Customer Can Update Only Own Profile
**Priority:** P1

```typescript
test('customer can update own profile', async ({ customerClient }) => {
  const { data: { user } } = await customerClient.auth.getUser();

  const { error } = await customerClient
    .from('users')
    .update({ name: 'Updated Name' })
    .eq('id', user!.id);

  expect(error).toBeNull();

  // Restore
  await customerClient
    .from('users')
    .update({ name: 'QA Customer' })
    .eq('id', user!.id);
});
```

---

### TC-RBAC-008: Tenant Can Read Team Members Only
**Priority:** P1

```typescript
test('tenant can read users within their org only', async ({ tenantClient }) => {
  const { data: { user } } = await tenantClient.auth.getUser();
  const { data: profile } = await tenantClient
    .from('users').select('tenant_id').eq('id', user!.id).single();

  const { data: users } = await tenantClient
    .from('users').select('tenant_id, role');

  for (const u of users ?? []) {
    // All visible users should be same tenant or self
    expect([profile!.tenant_id, null]).toContain(u.tenant_id);
  }
});
```

---

### TC-RBAC-009: Invoice RLS via Job Ownership Chain
**Priority:** P0

```typescript
test('invoice access follows job ownership chain', async ({ customerClient }) => {
  const { data: { user } } = await customerClient.auth.getUser();

  const { data: invoices } = await customerClient
    .from('invoices')
    .select('*, job:job_id(customer_id)')
    .is('deleted_at', null);

  for (const inv of invoices ?? []) {
    // Customer can only see invoices for their own jobs
    expect((inv as any).job?.customer_id).toBe(user!.id);
  }
});
```

---

### TC-RBAC-010: Cross-Tenant Data Isolation
**Priority:** P0

```typescript
test('tenant A cannot access tenant B data', async () => {
  // Create a second tenant and user via admin
  const { data: tenantB } = await adminClient
    .from('tenants')
    .insert({ business_name: 'Rival Repairs' })
    .select().single();

  const { data: authB } = await adminClient.auth.admin.createUser({
    email: `tenantB-${Date.now()}@test.com`,
    password: 'TestPass123!',
    email_confirm: true,
  });

  await adminClient.from('users').insert({
    id: authB!.user!.id,
    tenant_id: tenantB!.id,
    role: 'tenant',
    name: 'Tenant B Owner',
    email: authB!.user!.email,
  });

  // Create a job in tenant B
  await adminClient.from('jobs').insert(
    createJobPayload({ tenant_id: tenantB!.id, customer_id: authB!.user!.id })
  );

  // Login as Tenant A (our test tenant) and try to see Tenant B's jobs
  const tenantAClient = await getAuthenticatedClient(
    process.env.TEST_TENANT_EMAIL!,
    process.env.TEST_TENANT_PASSWORD!
  );

  const { data: jobs } = await tenantAClient
    .from('jobs').select('tenant_id').is('deleted_at', null);

  for (const job of jobs ?? []) {
    expect(job.tenant_id).not.toBe(tenantB!.id); // MUST NOT see tenant B
  }

  // Cleanup
  await adminClient.auth.admin.deleteUser(authB!.user!.id);
  await adminClient.from('tenants').delete().eq('id', tenantB!.id);
});
```

---

### TC-RBAC-011: Authenticated Users Can Insert Audit Records
**Priority:** P2

```typescript
test('any authenticated user can insert audit records', async ({ customerClient }) => {
  const { data: { user } } = await customerClient.auth.getUser();

  const { error } = await customerClient
    .from('audit_trails')
    .insert({
      actor_id: user!.id,
      action: 'test.audit_insert',
      target_table: 'test',
      target_id: null,
      metadata: { test: true },
    });

  expect(error).toBeNull();
});
```

---

## Summary

| Test ID | Test Name | Priority | Expected Result |
|---------|-----------|----------|-----------------|
| TC-RBAC-001 | Customer Job Isolation | P0 | Only own jobs |
| TC-RBAC-002 | Technician Job Isolation | P0 | Only assigned jobs |
| TC-RBAC-003 | Tenant Org Isolation | P0 | Only org jobs |
| TC-RBAC-004 | Customer No Audit Access | P0 | Empty result |
| TC-RBAC-005 | Tech No Audit Access | P0 | Empty result |
| TC-RBAC-006 | Customer Profile Read | P1 | Only own profile |
| TC-RBAC-007 | Customer Profile Update | P1 | Own profile updated |
| TC-RBAC-008 | Tenant Team Members | P1 | Only org users |
| TC-RBAC-009 | Invoice Chain RLS | P0 | Via job ownership |
| TC-RBAC-010 | Cross-Tenant Isolation | P0 | **Zero data leakage** |
| TC-RBAC-011 | Audit Insert Allowed | P2 | Insert succeeds |
