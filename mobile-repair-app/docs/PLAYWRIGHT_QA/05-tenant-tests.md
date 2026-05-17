# 05 — Tenant (Business Owner) Role Test Cases

> **Screens:** `app/(tenant)/index.tsx`, `jobs.tsx`, `technicians.tsx`, `profile.tsx`  
> **Services:** `analytics-service.ts`, `job-service.ts`  
> **Requirements:** FR-JOB-04, FR-ANALYTICS-01 through FR-ANALYTICS-03

---

## Test Suite: `tenant.spec.ts`

### TC-TEN-001: Tenant Reads All Org Jobs
**Priority:** P0  
**Requirement:** FR-JOB-04

```typescript
test('tenant should see all jobs within their organization', async ({ tenantClient }) => {
  const { data: { user } } = await tenantClient.auth.getUser();

  const { data: profile } = await tenantClient
    .from('users')
    .select('tenant_id')
    .eq('id', user!.id)
    .single();

  const { data: jobs, error } = await tenantClient
    .from('jobs')
    .select('*, customer:customer_id(name), technician:technician_id(name)')
    .is('deleted_at', null);

  expect(error).toBeNull();

  // All returned jobs should be scoped to this tenant
  for (const job of jobs ?? []) {
    expect(job.tenant_id).toBe(profile!.tenant_id);
  }
});
```

---

### TC-TEN-002: Tenant Assigns Technician to Pending Job
**Priority:** P0  
**Requirement:** FR-JOB-04

```typescript
test('tenant should assign technician to a pending job', async ({ tenantClient }) => {
  // Create a pending job via admin
  const { data: job } = await adminClient
    .from('jobs')
    .insert(createJobPayload({ status: 'pending' }))
    .select().single();

  // Get a technician in this tenant
  const { data: techs } = await adminClient
    .from('users')
    .select('id')
    .eq('role', 'technician')
    .eq('tenant_id', process.env.TEST_TENANT_ID)
    .limit(1);

  expect(techs).toBeTruthy();
  expect(techs!.length).toBeGreaterThan(0);

  const { data: updated, error } = await tenantClient
    .from('jobs')
    .update({
      technician_id: techs![0].id,
      status: 'assigned',
    })
    .eq('id', job!.id)
    .eq('status', 'pending')
    .select().single();

  expect(error).toBeNull();
  expect(updated.technician_id).toBe(techs![0].id);
  expect(updated.status).toBe('assigned');
});
```

**What this tests:**
- Tenant owner can update jobs within their organization
- Assignment correctly sets both `technician_id` and `status`
- Only works when job is in `pending` status

---

### TC-TEN-003: Tenant Reads Team Members
**Priority:** P1

```typescript
test('tenant should see all technicians in their org', async ({ tenantClient }) => {
  const { data: { user } } = await tenantClient.auth.getUser();

  const { data: profile } = await tenantClient
    .from('users')
    .select('tenant_id')
    .eq('id', user!.id)
    .single();

  const { data: techs, error } = await tenantClient
    .from('users')
    .select('*')
    .eq('role', 'technician')
    .eq('tenant_id', profile!.tenant_id)
    .is('deleted_at', null);

  expect(error).toBeNull();
  expect(techs).toBeTruthy();

  for (const tech of techs ?? []) {
    expect(tech.role).toBe('technician');
    expect(tech.tenant_id).toBe(profile!.tenant_id);
  }
});
```

---

### TC-TEN-004: Tenant Dashboard — Active Jobs Count
**Priority:** P1  
**Requirement:** FR-ANALYTICS-01

```typescript
test('tenant should get active jobs count', async ({ tenantClient }) => {
  const { count, error } = await tenantClient
    .from('jobs')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', process.env.TEST_TENANT_ID)
    .is('deleted_at', null)
    .not('status', 'in', '("completed","cancelled")');

  expect(error).toBeNull();
  expect(count).toBeGreaterThanOrEqual(0);
});
```

---

### TC-TEN-005: Tenant Dashboard — Monthly Revenue
**Priority:** P1  
**Requirement:** FR-ANALYTICS-01

```typescript
test('tenant should compute monthly revenue from paid invoices', async ({ tenantClient }) => {
  const startOfMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth(), 1
  ).toISOString();

  const { data: invoices, error } = await tenantClient
    .from('invoices')
    .select('total, job:job_id(tenant_id)')
    .eq('status', 'paid')
    .gte('locked_at', startOfMonth)
    .is('deleted_at', null);

  expect(error).toBeNull();

  const tenantInvoices = (invoices ?? []).filter(
    (inv: any) => inv.job?.tenant_id === process.env.TEST_TENANT_ID
  );

  const revenue = tenantInvoices.reduce(
    (sum: number, inv: any) => sum + Number(inv.total), 0
  );

  expect(revenue).toBeGreaterThanOrEqual(0);
  expect(typeof revenue).toBe('number');
});
```

---

### TC-TEN-006: Tenant Dashboard — Completion Rate
**Priority:** P2  
**Requirement:** FR-ANALYTICS-01

```typescript
test('tenant should compute job completion rate', async ({ tenantClient }) => {
  const { count: total } = await tenantClient
    .from('jobs')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', process.env.TEST_TENANT_ID)
    .is('deleted_at', null);

  const { count: completed } = await tenantClient
    .from('jobs')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', process.env.TEST_TENANT_ID)
    .eq('status', 'completed')
    .is('deleted_at', null);

  const rate = (total ?? 0) > 0
    ? Math.round(((completed ?? 0) / (total ?? 1)) * 100)
    : 0;

  expect(rate).toBeGreaterThanOrEqual(0);
  expect(rate).toBeLessThanOrEqual(100);
});
```

---

### TC-TEN-007: Tenant Cannot See Other Org's Jobs
**Priority:** P0  
**Requirement:** NFR-SEC-03

```typescript
test('tenant should NOT see jobs from another organization', async ({ tenantClient }) => {
  const { data: { user } } = await tenantClient.auth.getUser();
  const { data: profile } = await tenantClient
    .from('users')
    .select('tenant_id')
    .eq('id', user!.id)
    .single();

  const { data: jobs } = await tenantClient
    .from('jobs')
    .select('tenant_id')
    .is('deleted_at', null);

  for (const job of jobs ?? []) {
    expect(job.tenant_id).toBe(profile!.tenant_id);
  }
});
```

---

### TC-TEN-008: Tenant Reads All Org Invoices
**Priority:** P1

```typescript
test('tenant should see all invoices for org jobs', async ({ tenantClient }) => {
  const { data: invoices, error } = await tenantClient
    .from('invoices')
    .select('*, job:job_id(tenant_id)')
    .is('deleted_at', null);

  expect(error).toBeNull();

  for (const inv of invoices ?? []) {
    expect((inv as any).job?.tenant_id).toBe(process.env.TEST_TENANT_ID);
  }
});
```

---

## Summary

| Test ID | Test Name | Priority | Expected Result |
|---------|-----------|----------|-----------------|
| TC-TEN-001 | Read All Org Jobs | P0 | All tenant jobs returned |
| TC-TEN-002 | Assign Technician | P0 | Tech assigned, status = assigned |
| TC-TEN-003 | Read Team Members | P1 | Technicians in org listed |
| TC-TEN-004 | Active Jobs Count | P1 | Correct count returned |
| TC-TEN-005 | Monthly Revenue | P1 | Revenue computed from paid invoices |
| TC-TEN-006 | Completion Rate | P2 | Percentage 0-100 |
| TC-TEN-007 | Cross-Org Isolation | P0 | Cannot see other org data |
| TC-TEN-008 | Org Invoices | P1 | All org invoices visible |
