# Changelog

All notable changes to Revivix are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [1.0.0] — 2026-05-14

### Added
- **Authentication**: Real Supabase sign-up, sign-in, sign-out, password reset
- **Customer Flow**: 4-step booking wizard, job tracking, invoice viewing
- **Technician Flow**: Job management, Path A/B repair branching, dynamic invoice builder
- **Tenant Flow**: Analytics dashboard, technician management, job overview
- **Invoice System**: Dynamic line items, auto-recalculation, payment lock enforcement
- **Receiving Notes**: Device custody documentation for Path B repairs
- **Push Notifications**: Job status alerts, invoice events, in-app notification management
- **Audit Trail**: Immutable logging for all business-critical mutations
- **Settings Screen**: Notification preferences, account management, support links
- **Help & FAQ**: In-app support with contact options
- **404 Screen**: Custom not-found page for invalid routes
- **14 ADRs**: Industry-grade Architecture Decision Records
- **RLS Policies**: 42 Row-Level Security policies across 7 tables
- **Documentation**: SRS, SDD, test plan, user manual, API reference, deployment SOP
- **Legal**: Privacy policy, terms of service
- **CI/CD**: GitHub Actions workflow for lint, typecheck, and build

### Security
- JWT-based authentication with auto-refresh
- Row-Level Security on all database tables
- Environment variable protection
- Soft delete pattern (no hard deletes)
- Audit trail on all mutations
