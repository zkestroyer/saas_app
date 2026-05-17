# 03 — Customer Role Test Cases

> **Screens:** `app/(customer)/index.tsx`, `booking.tsx`, `invoices.tsx`, `track/[id].tsx`, `profile.tsx`, `settings.tsx`, `help.tsx`  
> **Services:** `job-service.ts`, `invoice-service.ts`  
> **Requirements:** FR-JOB-01, FR-JOB-02, FR-JOB-05

---

## Test Suite: `customer-jobs.spec.ts`

### TC-CUST-001: Create Job Booking (Home Visit)
**Priority:** P0 — Critical  
**Requirement:** FR-JOB-01, FR-JOB-02

```typescript
test('customer should create a home-visit repair booking', async ({ customerClient }) => {
  const { data: { user } } = await customerClient.auth.getUser();

  const { data: job, error } = await customerClient
    .from('jobs')
    .insert({
      customer_id: user!.id,
      tenant_id: process.env.TEST_TENANT_ID,
      device_brand: 'Apple',
      device_model: 'iPhone 15 Pro',
      issue_category: 'screen',
      description: 'Screen cracked after drop, touch still works partially',
      photos: [],
      service_type: 'home_visit',
      status: 'pending',
      location: { address: '123 Test Street, QA City' },
    })
    .select()
    .single();

  expect(error).toBeNull();
  expect(job.id).toBeTruthy();
  expect(job.status).toBe('pending');
  expect(job.device_brand).toBe('Apple');
  expect(job.device_model).toBe('iPhone 15 Pro');
  expect(job.issue_category).toBe('screen');
  expect(job.service_type).toBe('home_visit');
  expect(job.customer_id).toBe(user!.id);
  expect(job.technician_id).toBeNull(); // Not assigned yet
});
```

**What this tests:**
- Customer can insert a job into the `jobs` table
- All required fields are stored correctly
- Initial status is `pending`
- No technician assigned at creation

---

### TC-CUST-002: Create Job Booking (Store Drop-off)
**Priority:** P0  
**Requirement:** FR-JOB-01, FR-JOB-02

```typescript
test('customer should create a store-dropoff booking', async ({ customerClient }) => {
  const { data: { user } } = await customerClient.auth.getUser();

  const { data: job, error } = await customerClient
    .from('jobs')
    .insert({
      customer_id: user!.id,
      tenant_id: process.env.TEST_TENANT_ID,
      device_brand: 'Samsung',
      device_model: 'Galaxy S24 Ultra',
      issue_category: 'battery',
      description: 'Battery drains within 2 hours, phone gets very hot',
      photos: [],
      service_type: 'store_dropoff',
      status: 'pending',
      location: {},
    })
    .select()
    .single();

  expect(error).toBeNull();
  expect(job.service_type).toBe('store_dropoff');
  expect(job.issue_category).toBe('battery');
});
```

---

### TC-CUST-003: All 8 Issue Categories Accepted
**Priority:** P1  
**Requirement:** FR-JOB-02

```typescript
const ISSUE_CATEGORIES = ['screen', 'battery', 'software', 'charging', 'camera', 'speaker', 'water_damage', 'other'];

for (const category of ISSUE_CATEGORIES) {
  test(`should accept issue category: ${category}`, async ({ customerClient }) => {
    const { data: { user } } = await customerClient.auth.getUser();

    const { data: job, error } = await customerClient
      .from('jobs')
      .insert({
        customer_id: user!.id,
        tenant_id: process.env.TEST_TENANT_ID,
        device_brand: 'Google',
        device_model: 'Pixel 8',
        issue_category: category,
        description: `Testing ${category} category acceptance`,
        service_type: 'home_visit',
        status: 'pending',
        location: { address: 'Test Address' },
      })
      .select()
      .single();

    expect(error).toBeNull();
    expect(job.issue_category).toBe(category);
  });
}
```

---

### TC-CUST-004: Reject Invalid Issue Category
**Priority:** P1  
**Requirement:** FR-JOB-02

```typescript
test('should reject invalid issue category', async ({ customerClient }) => {
  const { data: { user } } = await customerClient.auth.getUser();

  const { error } = await customerClient
    .from('jobs')
    .insert({
      customer_id: user!.id,
      tenant_id: process.env.TEST_TENANT_ID,
      device_brand: 'Apple',
      device_model: 'iPhone 15',
      issue_category: 'invalid_category', // Not in CHECK constraint
      description: 'Test invalid category',
      service_type: 'home_visit',
      status: 'pending',
    });

  expect(error).toBeTruthy();
  expect(error!.message).toContain('check');
});
```

---

### TC-CUST-005: Customer Reads Own Jobs
**Priority:** P0  
**Requirement:** FR-JOB-05

```typescript
test('customer should see only their own jobs', async ({ customerClient }) => {
  const { data: { user } } = await customerClient.auth.getUser();

  const { data: jobs, error } = await customerClient
    .from('jobs')
    .select('*')
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  expect(error).toBeNull();
  expect(jobs).toBeTruthy();

  // RLS ensures ALL returned jobs belong to this customer
  for (const job of jobs!) {
    expect(job.customer_id).toBe(user!.id);
  }
});
```

---

### TC-CUST-006: Customer Reads Own Invoices
**Priority:** P1  
**Requirement:** FR-INV-01

```typescript
test('customer should see invoices for their jobs only', async ({ customerClient }) => {
  const { data: { user } } = await customerClient.auth.getUser();

  const { data: invoices, error } = await customerClient
    .from('invoices')
    .select('*, job:job_id(customer_id)')
    .is('deleted_at', null);

  expect(error).toBeNull();

  // All invoices should belong to jobs owned by this customer
  for (const inv of invoices ?? []) {
    expect((inv as any).job?.customer_id).toBe(user!.id);
  }
});
```

---

### TC-CUST-007: Customer Cannot Create Jobs for Other Users
**Priority:** P0  
**Requirement:** NFR-SEC-03

```typescript
test('customer cannot create a job for another customer', async ({ customerClient }) => {
  const { error } = await customerClient
    .from('jobs')
    .insert({
      customer_id: 'some-other-user-id', // Not this user
      tenant_id: process.env.TEST_TENANT_ID,
      device_brand: 'Apple',
      device_model: 'iPhone 15',
      issue_category: 'screen',
      description: 'Attempting unauthorized job creation',
      service_type: 'home_visit',
      status: 'pending',
    });

  // RLS policy: customer_id must equal auth.uid()
  expect(error).toBeTruthy();
});
```

---

### TC-CUST-008: Customer Cannot Update Job Status
**Priority:** P1  
**Requirement:** NFR-SEC-03

```typescript
test('customer cannot directly update job status', async ({ customerClient }) => {
  const { data: jobs } = await customerClient
    .from('jobs')
    .select('id')
    .limit(1)
    .single();

  if (!jobs) return; // Skip if no jobs

  // Customers have no UPDATE policy on jobs
  const { error } = await customerClient
    .from('jobs')
    .update({ status: 'completed' })
    .eq('id', jobs.id);

  expect(error).toBeTruthy();
});
```

---

### TC-CUST-009: Track Job Status
**Priority:** P1  
**Requirement:** FR-JOB-05

```typescript
test('customer can track individual job details', async ({ customerClient }) => {
  const { data: { user } } = await customerClient.auth.getUser();

  const { data: jobs } = await customerClient
    .from('jobs')
    .select('*')
    .eq('customer_id', user!.id)
    .is('deleted_at', null)
    .limit(1);

  if (!jobs || jobs.length === 0) return;

  const { data: job, error } = await customerClient
    .from('jobs')
    .select('*, customer:customer_id(name, email, phone)')
    .eq('id', jobs[0].id)
    .single();

  expect(error).toBeNull();
  expect(job.id).toBe(jobs[0].id);
  expect(job.status).toBeTruthy();
  expect(['pending', 'assigned', 'en_route', 'diagnosing', 'repairing', 'completed', 'cancelled'])
    .toContain(job.status);
});
```

---

## Summary

| Test ID | Test Name | Priority | Expected Result |
|---------|-----------|----------|-----------------|
| TC-CUST-001 | Create Home Visit Booking | P0 | Job created with pending status |
| TC-CUST-002 | Create Store Drop-off | P0 | Job created with store_dropoff type |
| TC-CUST-003 | All Issue Categories | P1 | All 8 categories accepted |
| TC-CUST-004 | Invalid Issue Category | P1 | Rejected by CHECK constraint |
| TC-CUST-005 | Read Own Jobs | P0 | Only own jobs returned (RLS) |
| TC-CUST-006 | Read Own Invoices | P1 | Only own invoices returned (RLS) |
| TC-CUST-007 | Create Job for Others | P0 | Rejected by RLS |
| TC-CUST-008 | Update Job Status | P1 | Rejected — no UPDATE policy |
| TC-CUST-009 | Track Job Details | P1 | Job details returned with status |
