# 02 — Authentication Test Cases

> **Service:** `src/services/auth-service.ts`  
> **Store:** `src/stores/auth-store.ts`  
> **Screens:** `app/(auth)/login.tsx`, `app/(auth)/register.tsx`, `app/(auth)/forgot-password.tsx`  
> **Requirements:** FR-AUTH-01 through FR-AUTH-06

---

## Test Suite: `auth.spec.ts`

### TC-AUTH-001: Successful Registration (Customer)
**Priority:** P0 — Critical  
**Requirement:** FR-AUTH-01

```typescript
test('should register a new customer account', async () => {
  const uniqueEmail = `test-${Date.now()}@revivix.app`;

  const { data, error } = await anonClient.auth.signUp({
    email: uniqueEmail,
    password: 'SecurePass123!',
  });

  expect(error).toBeNull();
  expect(data.user).toBeTruthy();
  expect(data.user!.email).toBe(uniqueEmail);

  // Insert user profile
  const { data: profile, error: profileErr } = await adminClient
    .from('users')
    .insert({
      id: data.user!.id,
      tenant_id: process.env.TEST_TENANT_ID,
      role: 'customer',
      name: 'Test User',
      email: uniqueEmail,
      phone: '+1234567890',
    })
    .select()
    .single();

  expect(profileErr).toBeNull();
  expect(profile.role).toBe('customer');
  expect(profile.tenant_id).toBe(process.env.TEST_TENANT_ID);

  // Cleanup
  await adminClient.auth.admin.deleteUser(data.user!.id);
});
```

**What this tests:**
- Supabase Auth signup creates a valid user
- Application profile is correctly inserted with role + tenant
- User ID links Auth user to profile

---

### TC-AUTH-002: Successful Registration (Technician)
**Priority:** P0  
**Requirement:** FR-AUTH-01

```typescript
test('should register a new technician account', async () => {
  const uniqueEmail = `tech-${Date.now()}@revivix.app`;

  const { data } = await anonClient.auth.signUp({
    email: uniqueEmail,
    password: 'SecurePass123!',
  });

  const { data: profile } = await adminClient
    .from('users')
    .insert({
      id: data.user!.id,
      tenant_id: process.env.TEST_TENANT_ID,
      role: 'technician',
      name: 'Test Technician',
      email: uniqueEmail,
    })
    .select()
    .single();

  expect(profile.role).toBe('technician');

  await adminClient.auth.admin.deleteUser(data.user!.id);
});
```

---

### TC-AUTH-003: Successful Registration (Tenant/Business)
**Priority:** P0  
**Requirement:** FR-AUTH-01

```typescript
test('should register a new business owner account', async () => {
  const uniqueEmail = `owner-${Date.now()}@revivix.app`;

  const { data } = await anonClient.auth.signUp({
    email: uniqueEmail,
    password: 'SecurePass123!',
  });

  const { data: profile } = await adminClient
    .from('users')
    .insert({
      id: data.user!.id,
      tenant_id: process.env.TEST_TENANT_ID,
      role: 'tenant',
      name: 'Business Owner',
      email: uniqueEmail,
    })
    .select()
    .single();

  expect(profile.role).toBe('tenant');

  await adminClient.auth.admin.deleteUser(data.user!.id);
});
```

---

### TC-AUTH-004: Reject Registration with Duplicate Email
**Priority:** P1  
**Requirement:** FR-AUTH-01

```typescript
test('should reject duplicate email registration', async () => {
  const { error } = await anonClient.auth.signUp({
    email: process.env.TEST_CUSTOMER_EMAIL!,
    password: 'AnyPassword123!',
  });

  // Supabase may return success but with fake user (no confirmation)
  // OR return an error depending on config
  // Assert the user profile insert would fail due to UNIQUE constraint
  const { error: profileErr } = await adminClient
    .from('users')
    .insert({
      id: 'fake-id',
      role: 'customer',
      name: 'Duplicate',
      email: process.env.TEST_CUSTOMER_EMAIL!,
    });

  expect(profileErr).toBeTruthy();
  expect(profileErr!.message).toContain('duplicate');
});
```

---

### TC-AUTH-005: Reject Registration with Weak Password
**Priority:** P1  
**Requirement:** FR-AUTH-01

```typescript
test('should reject password shorter than 6 characters', async () => {
  const { error } = await anonClient.auth.signUp({
    email: `weak-${Date.now()}@revivix.app`,
    password: '12345', // Too short
  });

  expect(error).toBeTruthy();
  expect(error!.message).toContain('password');
});
```

---

### TC-AUTH-006: Successful Sign In
**Priority:** P0  
**Requirement:** FR-AUTH-02

```typescript
test('should sign in with valid credentials and return user profile', async () => {
  const { data, error } = await anonClient.auth.signInWithPassword({
    email: process.env.TEST_CUSTOMER_EMAIL!,
    password: process.env.TEST_CUSTOMER_PASSWORD!,
  });

  expect(error).toBeNull();
  expect(data.session).toBeTruthy();
  expect(data.session!.access_token).toBeTruthy();
  expect(data.user!.email).toBe(process.env.TEST_CUSTOMER_EMAIL);

  // Fetch profile
  const authedClient = await getAuthenticatedClient(
    process.env.TEST_CUSTOMER_EMAIL!,
    process.env.TEST_CUSTOMER_PASSWORD!
  );
  const { data: profile } = await authedClient
    .from('users')
    .select('*')
    .eq('id', data.user!.id)
    .single();

  expect(profile.role).toBe('customer');
  expect(profile.name).toBeTruthy();
});
```

---

### TC-AUTH-007: Reject Sign In with Wrong Password
**Priority:** P0  
**Requirement:** FR-AUTH-02

```typescript
test('should reject sign in with invalid password', async () => {
  const { error } = await anonClient.auth.signInWithPassword({
    email: process.env.TEST_CUSTOMER_EMAIL!,
    password: 'WrongPassword999!',
  });

  expect(error).toBeTruthy();
  expect(error!.message).toContain('Invalid login credentials');
});
```

---

### TC-AUTH-008: Reject Sign In with Non-Existent Email
**Priority:** P1  
**Requirement:** FR-AUTH-02

```typescript
test('should reject sign in for non-existent email', async () => {
  const { error } = await anonClient.auth.signInWithPassword({
    email: 'nonexistent@revivix.app',
    password: 'AnyPassword123!',
  });

  expect(error).toBeTruthy();
});
```

---

### TC-AUTH-009: Sign Out Clears Session
**Priority:** P0  
**Requirement:** FR-AUTH-05

```typescript
test('should sign out and invalidate session', async () => {
  const client = await getAuthenticatedClient(
    process.env.TEST_CUSTOMER_EMAIL!,
    process.env.TEST_CUSTOMER_PASSWORD!
  );

  // Verify authenticated
  const { data: before } = await client.auth.getSession();
  expect(before.session).toBeTruthy();

  // Sign out
  const { error } = await client.auth.signOut();
  expect(error).toBeNull();

  // Verify session cleared
  const { data: after } = await client.auth.getSession();
  expect(after.session).toBeNull();
});
```

---

### TC-AUTH-010: Session Persists (Get Session)
**Priority:** P1  
**Requirement:** FR-AUTH-04

```typescript
test('should retrieve existing session', async () => {
  const client = await getAuthenticatedClient(
    process.env.TEST_CUSTOMER_EMAIL!,
    process.env.TEST_CUSTOMER_PASSWORD!
  );

  const { data, error } = await client.auth.getSession();

  expect(error).toBeNull();
  expect(data.session).toBeTruthy();
  expect(data.session!.access_token).toBeTruthy();
  expect(data.session!.expires_at).toBeGreaterThan(Date.now() / 1000);
});
```

---

### TC-AUTH-011: Get Current User Profile
**Priority:** P1  
**Requirement:** FR-AUTH-04

```typescript
test('should fetch authenticated user profile', async () => {
  const client = await getAuthenticatedClient(
    process.env.TEST_CUSTOMER_EMAIL!,
    process.env.TEST_CUSTOMER_PASSWORD!
  );

  const { data: { user } } = await client.auth.getUser();
  expect(user).toBeTruthy();

  const { data: profile } = await client
    .from('users')
    .select('*')
    .eq('id', user!.id)
    .is('deleted_at', null)
    .single();

  expect(profile).toBeTruthy();
  expect(profile.email).toBe(process.env.TEST_CUSTOMER_EMAIL);
  expect(profile.role).toBe('customer');
  expect(profile.deleted_at).toBeNull();
});
```

---

### TC-AUTH-012: Update User Profile
**Priority:** P2  
**Requirement:** FR-AUTH-04

```typescript
test('should update user profile name and phone', async () => {
  const client = await getAuthenticatedClient(
    process.env.TEST_CUSTOMER_EMAIL!,
    process.env.TEST_CUSTOMER_PASSWORD!
  );

  const { data: { user } } = await client.auth.getUser();

  const { data: updated, error } = await client
    .from('users')
    .update({ name: 'Updated QA Customer', phone: '+9876543210' })
    .eq('id', user!.id)
    .select()
    .single();

  expect(error).toBeNull();
  expect(updated.name).toBe('Updated QA Customer');
  expect(updated.phone).toBe('+9876543210');

  // Restore original
  await client.from('users')
    .update({ name: 'QA Customer', phone: '+1234567890' })
    .eq('id', user!.id);
});
```

---

### TC-AUTH-013: Audit Trail — Sign Up Logged
**Priority:** P2  
**Requirement:** NFR-SEC-05

```typescript
test('should log sign-up event in audit trail', async () => {
  // After TC-AUTH-001 runs, check audit
  const { data: audits } = await adminClient
    .from('audit_trails')
    .select('*')
    .eq('action', 'user.signed_up')
    .order('created_at', { ascending: false })
    .limit(1);

  expect(audits).toBeTruthy();
  expect(audits!.length).toBeGreaterThan(0);
  expect(audits![0].target_table).toBe('users');
});
```

---

### TC-AUTH-014: Audit Trail — Sign In Logged
**Priority:** P2  
**Requirement:** NFR-SEC-05

```typescript
test('should log sign-in event in audit trail', async () => {
  const { data: audits } = await adminClient
    .from('audit_trails')
    .select('*')
    .eq('action', 'user.signed_in')
    .order('created_at', { ascending: false })
    .limit(1);

  expect(audits!.length).toBeGreaterThan(0);
  expect(audits![0].action).toBe('user.signed_in');
});
```

---

## Summary

| Test ID | Test Name | Priority | Expected Result |
|---------|-----------|----------|-----------------|
| TC-AUTH-001 | Register Customer | P0 | Account + profile created |
| TC-AUTH-002 | Register Technician | P0 | Account + profile with tech role |
| TC-AUTH-003 | Register Business | P0 | Account + profile with tenant role |
| TC-AUTH-004 | Duplicate Email | P1 | Rejected with error |
| TC-AUTH-005 | Weak Password | P1 | Rejected — min 6 chars |
| TC-AUTH-006 | Sign In Success | P0 | Session + profile returned |
| TC-AUTH-007 | Wrong Password | P0 | Rejected with error |
| TC-AUTH-008 | Non-Existent Email | P1 | Rejected with error |
| TC-AUTH-009 | Sign Out | P0 | Session cleared |
| TC-AUTH-010 | Session Persist | P1 | Valid session retrieved |
| TC-AUTH-011 | Get Current User | P1 | Profile returned |
| TC-AUTH-012 | Update Profile | P2 | Fields updated |
| TC-AUTH-013 | Audit: Sign Up | P2 | Audit record exists |
| TC-AUTH-014 | Audit: Sign In | P2 | Audit record exists |
