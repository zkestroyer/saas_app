# Revivix — Test Plan
## Version 1.0

---

## 1. Test Strategy

### 1.1 Scope
Testing covers: service layer logic, state management, UI screen rendering, and end-to-end workflows.

### 1.2 Test Levels
| Level | Tool | Coverage |
|-------|------|----------|
| Unit | Jest | Service functions, validators, formatters |
| Integration | Jest + mock Supabase | Service → store interactions |
| UI | React Native Testing Library | Screen rendering, user interactions |
| E2E | Manual + EAS Preview | Full user workflows |

### 1.3 Test Environment
- **Local:** Jest with TypeScript, mocked Supabase client
- **Device:** EAS Preview builds on physical Android/iOS devices
- **CI:** GitHub Actions running lint → typecheck → test

---

## 2. Unit Test Cases

### 2.1 Auth Service
| ID | Test Case | Expected Result |
|----|-----------|-----------------|
| AUTH-01 | signUp with valid data | Returns success + user profile |
| AUTH-02 | signUp with existing email | Returns error |
| AUTH-03 | signIn with valid credentials | Returns session + profile |
| AUTH-04 | signIn with wrong password | Returns error message |
| AUTH-05 | signOut | Clears session |
| AUTH-06 | getCurrentUser when authenticated | Returns user profile |

### 2.2 Job Service
| ID | Test Case | Expected Result |
|----|-----------|-----------------|
| JOB-01 | createJob with valid input | Returns new job with status=pending |
| JOB-02 | updateJobStatus valid transition | Updates successfully |
| JOB-03 | updateJobStatus invalid transition | Returns INVALID_STATUS_TRANSITION |
| JOB-04 | assignTechnician to pending job | Updates technician_id + status=assigned |
| JOB-05 | getCustomerJobs excludes soft-deleted | Returns only active jobs |

### 2.3 Invoice Service
| ID | Test Case | Expected Result |
|----|-----------|-----------------|
| INV-01 | createInvoice | Returns draft invoice with zero totals |
| INV-02 | addLineItem to unlocked invoice | Adds item + recalculates totals |
| INV-03 | addLineItem to locked invoice | Returns INVOICE_LOCKED error |
| INV-04 | removeLineItem from unlocked | Soft deletes + recalculates |
| INV-05 | lockInvoice | Sets is_locked=true, status=paid |
| INV-06 | lockInvoice already locked | Returns error |

### 2.4 Validators
| ID | Test Case | Expected Result |
|----|-----------|-----------------|
| VAL-01 | isValidEmail('user@test.com') | true |
| VAL-02 | isValidEmail('invalid') | false |
| VAL-03 | isValidPassword('123456') | true |
| VAL-04 | isValidPassword('12345') | false |

### 2.5 Formatters
| ID | Test Case | Expected Result |
|----|-----------|-----------------|
| FMT-01 | formatCurrency(1234.5) | "$1,234.50" |
| FMT-02 | humanize('water_damage') | "Water damage" |
| FMT-03 | formatJobId('abc12345-...') | "ABC12345" |

---

## 3. Integration Test Cases

### 3.1 Booking Flow
| ID | Test Case |
|----|-----------|
| INT-01 | Customer creates job → appears in customer dashboard |
| INT-02 | Tenant assigns technician → job appears in technician queue |
| INT-03 | Technician completes job → status changes to completed |

### 3.2 Invoice Flow
| ID | Test Case |
|----|-----------|
| INT-04 | Create invoice → add items → totals recalculate correctly |
| INT-05 | Lock invoice → job status changes to completed |
| INT-06 | Attempt to modify locked invoice → all mutations rejected |

---

## 4. Manual Test Cases

### 4.1 Authentication
- [ ] Register new customer account
- [ ] Login with registered credentials
- [ ] Reset password via email
- [ ] Session persists across app restart
- [ ] Logout clears all state

### 4.2 Customer Flow
- [ ] Complete 4-step booking wizard
- [ ] View active jobs on dashboard
- [ ] Track repair status
- [ ] View invoices list
- [ ] Update profile
- [ ] Access settings and help screens

### 4.3 Technician Flow
- [ ] View assigned jobs
- [ ] Select Path A (on-spot repair)
- [ ] Select Path B (shop repair + receiving note)
- [ ] Build invoice with line items
- [ ] Lock invoice after payment

### 4.4 Push Notifications
- [ ] Receive notification on job status change
- [ ] Tap notification navigates to correct screen
- [ ] Toggle notification preferences in settings

---

## 5. Performance Test Cases
- [ ] App cold start under 3 seconds
- [ ] Screen transitions under 300ms
- [ ] Dashboard loads within 2 seconds
- [ ] No memory leaks on repeated navigation
