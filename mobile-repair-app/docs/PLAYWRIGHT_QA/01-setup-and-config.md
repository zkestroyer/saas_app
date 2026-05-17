# 01 — Playwright Setup & Configuration

---

## 1. Installation

```bash
# From project root (mobile-repair-app/)
npm init playwright@latest

# Install Supabase JS client for API tests
npm install @supabase/supabase-js --save-dev
```

## 2. Playwright Config

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false, // Sequential — tests share DB state
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results.json' }],
  ],
  use: {
    baseURL: process.env.SUPABASE_URL,
    extraHTTPHeaders: {
      'apikey': process.env.SUPABASE_ANON_KEY!,
      'Content-Type': 'application/json',
    },
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'api-tests',
      testDir: './tests/e2e/api',
    },
    {
      name: 'web-tests',
      testDir: './tests/e2e/web',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
```

## 3. Environment Variables

```env
# .env.test — NEVER commit this file
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbG...your-anon-key
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...service-role-key  # For test setup/teardown

# Test user credentials (pre-seeded)
TEST_CUSTOMER_EMAIL=customer@test.revivix.app
TEST_CUSTOMER_PASSWORD=TestPass123!
TEST_TECHNICIAN_EMAIL=technician@test.revivix.app
TEST_TECHNICIAN_PASSWORD=TestPass123!
TEST_TENANT_EMAIL=tenant@test.revivix.app
TEST_TENANT_PASSWORD=TestPass123!

# Test tenant
TEST_TENANT_ID=<uuid-of-test-tenant>
```

## 4. Test Directory Structure

```
tests/e2e/
├── api/
│   ├── auth.spec.ts          # Auth service tests
│   ├── jobs.spec.ts           # Job CRUD + state machine
│   ├── invoices.spec.ts       # Invoice lifecycle + lock
│   ├── receiving-notes.spec.ts
│   ├── analytics.spec.ts
│   ├── rbac.spec.ts           # Cross-role access tests
│   └── rls.spec.ts            # Row-level security tests
├── web/                       # (If web export exists)
│   ├── auth-flow.spec.ts
│   ├── booking-flow.spec.ts
│   └── dashboard.spec.ts
├── fixtures/
│   ├── auth.fixture.ts        # Authenticated context fixtures
│   ├── seed.fixture.ts        # Test data seeding
│   └── cleanup.fixture.ts     # Test data teardown
└── helpers/
    ├── supabase-client.ts     # Shared Supabase test client
    ├── api-helpers.ts         # Common API call wrappers
    └── test-data.ts           # Factory functions for test data
```

## 5. Shared Supabase Client Helper

```typescript
// tests/e2e/helpers/supabase-client.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/** Anon client — simulates unauthenticated access */
export const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/** Service role client — bypasses RLS for setup/teardown */
export const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

/** Creates an authenticated client for a specific user */
export async function getAuthenticatedClient(
  email: string,
  password: string
): Promise<SupabaseClient> {
  const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw new Error(`Auth failed for ${email}: ${error.message}`);
  return client;
}
```

## 6. Auth Fixture

```typescript
// tests/e2e/fixtures/auth.fixture.ts
import { test as base } from '@playwright/test';
import { SupabaseClient } from '@supabase/supabase-js';
import { getAuthenticatedClient } from '../helpers/supabase-client';

type AuthFixtures = {
  customerClient: SupabaseClient;
  technicianClient: SupabaseClient;
  tenantClient: SupabaseClient;
};

export const test = base.extend<AuthFixtures>({
  customerClient: async ({}, use) => {
    const client = await getAuthenticatedClient(
      process.env.TEST_CUSTOMER_EMAIL!,
      process.env.TEST_CUSTOMER_PASSWORD!
    );
    await use(client);
    await client.auth.signOut();
  },

  technicianClient: async ({}, use) => {
    const client = await getAuthenticatedClient(
      process.env.TEST_TECHNICIAN_EMAIL!,
      process.env.TEST_TECHNICIAN_PASSWORD!
    );
    await use(client);
    await client.auth.signOut();
  },

  tenantClient: async ({}, use) => {
    const client = await getAuthenticatedClient(
      process.env.TEST_TENANT_EMAIL!,
      process.env.TEST_TENANT_PASSWORD!
    );
    await use(client);
    await client.auth.signOut();
  },
});

export { expect } from '@playwright/test';
```

## 7. Test Data Factory

```typescript
// tests/e2e/helpers/test-data.ts

export function createJobPayload(overrides: Partial<any> = {}) {
  return {
    customer_id: process.env.TEST_CUSTOMER_ID!,
    tenant_id: process.env.TEST_TENANT_ID!,
    device_brand: 'Apple',
    device_model: 'iPhone 15 Pro',
    issue_category: 'screen',
    description: 'Screen cracked after drop — needs full replacement',
    photos: [],
    service_type: 'home_visit',
    status: 'pending',
    location: { address: '123 Test St, QA City' },
    ...overrides,
  };
}

export function createInvoiceItemPayload(overrides: Partial<any> = {}) {
  return {
    type: 'part',
    description: 'OEM Screen Assembly',
    quantity: 1,
    unit_price: 149.99,
    ...overrides,
  };
}

export function createReceivingNotePayload(jobId: string, overrides: Partial<any> = {}) {
  return {
    job_id: jobId,
    device_condition: 'Screen cracked, back glass intact, powers on normally',
    damage_photos: [],
    customer_signature_url: null,
    notes: 'Customer confirmed no water damage',
    ...overrides,
  };
}
```

## 8. Database Seed Script

```typescript
// tests/e2e/fixtures/seed.fixture.ts
import { adminClient } from '../helpers/supabase-client';

/**
 * Seeds the test database with a tenant, customer, technician, and tenant owner.
 * Run ONCE before the test suite. Uses service role (bypasses RLS).
 */
export async function seedTestData() {
  // 1. Create test tenant
  const { data: tenant } = await adminClient
    .from('tenants')
    .upsert({ id: process.env.TEST_TENANT_ID, business_name: 'QA Test Repairs', plan: 'pro' })
    .select()
    .single();

  // 2. Create test users via Supabase Auth Admin API
  const users = [
    { email: process.env.TEST_CUSTOMER_EMAIL!, role: 'customer', name: 'QA Customer' },
    { email: process.env.TEST_TECHNICIAN_EMAIL!, role: 'technician', name: 'QA Technician' },
    { email: process.env.TEST_TENANT_EMAIL!, role: 'tenant', name: 'QA Business Owner' },
  ];

  for (const u of users) {
    const { data: authUser } = await adminClient.auth.admin.createUser({
      email: u.email,
      password: 'TestPass123!',
      email_confirm: true,
    });

    if (authUser?.user) {
      await adminClient.from('users').upsert({
        id: authUser.user.id,
        tenant_id: tenant?.id,
        role: u.role,
        name: u.name,
        email: u.email,
        phone: '+1234567890',
      });
    }
  }

  console.log('✅ Test data seeded successfully');
}

export async function cleanupTestData() {
  // Soft-delete all test jobs and invoices
  const now = new Date().toISOString();
  await adminClient.from('invoice_items').update({ deleted_at: now }).eq('invoice_id', 'test%');
  await adminClient.from('invoices').update({ deleted_at: now }).eq('job_id', 'test%');
  await adminClient.from('receiving_notes').update({ deleted_at: now }).eq('job_id', 'test%');
  await adminClient.from('jobs').update({ deleted_at: now }).eq('tenant_id', process.env.TEST_TENANT_ID!);
  console.log('🧹 Test data cleaned up');
}
```

## 9. Global Setup/Teardown

```typescript
// tests/e2e/global-setup.ts
import { seedTestData } from './fixtures/seed.fixture';

async function globalSetup() {
  await seedTestData();
}

export default globalSetup;
```

```typescript
// tests/e2e/global-teardown.ts
import { cleanupTestData } from './fixtures/seed.fixture';

async function globalTeardown() {
  await cleanupTestData();
}

export default globalTeardown;
```

Add to `playwright.config.ts`:
```typescript
globalSetup: './tests/e2e/global-setup.ts',
globalTeardown: './tests/e2e/global-teardown.ts',
```
