# Revivix 📱

> Premium Mobile Repair Network — Connect customers with certified repair technicians.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![Expo](https://img.shields.io/badge/Expo-54-000020.svg)](https://expo.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E.svg)](https://supabase.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

---

## 🚀 Overview

Revivix is a multi-tenant SaaS mobile application for managing mobile device repair operations. It serves four user roles with isolated, role-specific experiences:

| Role | Description |
|------|-------------|
| 👤 **Customer** | Book repairs, track status, view invoices |
| 🔧 **Technician** | Manage jobs, diagnose, build invoices |
| 🏢 **Tenant (Business)** | Analytics dashboard, manage technicians |
| ⚡ **Super Admin** | System-wide access, audit trails |

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Mobile** | React Native (Expo SDK 54) |
| **Routing** | Expo Router (file-based) |
| **State** | Zustand (client) + TanStack Query (server) |
| **Backend** | Supabase (PostgreSQL, Auth, Storage, Realtime) |
| **Styling** | Custom design system with glassmorphism |
| **Notifications** | Expo Notifications (push + local) |
| **Build** | EAS Build (development, preview, production) |
| **CI/CD** | GitHub Actions |

---

## 📁 Project Structure

```
mobile-repair-app/
├── app/                        # Screens (Expo Router)
│   ├── (auth)/                 # Login, Register, Forgot Password
│   ├── (customer)/             # Customer screens
│   ├── (technician)/           # Technician screens
│   ├── (tenant)/               # Business owner screens
│   ├── _layout.tsx             # Root layout + providers
│   ├── index.tsx               # Entry point / router
│   └── +not-found.tsx          # 404 screen
├── src/
│   ├── components/             # Reusable UI components
│   │   ├── ui/                 # Atoms: Button, Input, Badge, etc.
│   │   └── splash-screen.tsx   # Animated splash screen
│   ├── services/               # Supabase service layer
│   │   ├── auth-service.ts     # Authentication
│   │   ├── job-service.ts      # Job CRUD + state machine
│   │   ├── invoice-service.ts  # Invoicing + payment lock
│   │   ├── notification-service.ts # Push notifications
│   │   ├── receiving-note-service.ts
│   │   ├── analytics-service.ts
│   │   ├── audit-service.ts
│   │   └── supabase.ts         # Client singleton
│   ├── stores/                 # Zustand state stores
│   ├── hooks/                  # Custom React hooks
│   ├── utils/                  # Formatters, validators
│   ├── constants/              # App-wide constants
│   ├── theme/                  # Design tokens
│   └── types/                  # TypeScript definitions
├── supabase/
│   └── schema.sql              # Database schema + RLS policies
├── docs/                       # Documentation vault
│   ├── adr/                    # Architecture Decision Records
│   ├── SRS/                    # Software Requirements Spec
│   ├── SDD/                    # Software Design Document
│   ├── TESTING/                # Test plan
│   ├── USER_MANUAL/            # End-user guide
│   ├── APP_STORE/              # Store listing metadata
│   └── ...                     # API ref, DB schema, deployment SOP
├── tests/                      # Test files
├── .github/workflows/          # CI/CD pipelines
├── assets/                     # App icons, splash screen
├── PRIVACY_POLICY.md
├── TERMS_OF_SERVICE.md
├── CHANGELOG.md
├── CONTRIBUTING.md
└── LICENSE
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Supabase project (free tier works)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/revivix.git
cd revivix/mobile-repair-app

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your Supabase credentials

# Start development
npx expo start
```

### Database Setup
1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run `supabase/schema.sql` in the SQL Editor
3. Update `.env` with your project URL and anon key

---

## 📱 Building for Production

```bash
# Preview APK (Android)
eas build --profile preview --platform android

# Production AAB (Android)
eas build --profile production --platform android

# Production IPA (iOS)
eas build --profile production --platform ios
```

---

## 📖 Documentation

| Document | Path |
|----------|------|
| Architecture Decisions | [docs/adr/](./docs/adr/) |
| System Architecture | [docs/system-architecture.md](./docs/system-architecture.md) |
| Database Schema | [docs/database-schema.md](./docs/database-schema.md) |
| API Reference | [docs/api-reference.md](./docs/api-reference.md) |
| Software Requirements | [docs/SRS/](./docs/SRS/) |
| Software Design | [docs/SDD/](./docs/SDD/) |
| Test Plan | [docs/TESTING/](./docs/TESTING/) |
| User Guide | [docs/USER_MANUAL/](./docs/USER_MANUAL/) |
| Deployment SOP | [docs/deployment-sop.md](./docs/deployment-sop.md) |

---

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## 📄 License

This project is licensed under the MIT License — see [LICENSE](./LICENSE) for details.

## 🔒 Legal

- [Privacy Policy](./PRIVACY_POLICY.md)
- [Terms of Service](./TERMS_OF_SERVICE.md)
