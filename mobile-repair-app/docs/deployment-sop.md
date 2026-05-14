# Revivix — DevOps & Deployment SOP

> **Document ID:** DOC-DO-001  
> **Version:** 1.0  
> **Date:** 2026-05-14  
> **Author:** Solution Architect (Antigravity AI System)  
> **Classification:** Internal — Next App World  
> **Project:** Revivix Mobile Repair SaaS Platform

---

## 1. Environment Pipeline

Per Master Guidelines Phase 8: 3-Tier Environment Pipeline.

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│    LOCAL     │────▶│    DEMO      │────▶│    LIVE      │
│   (Dev)      │     │  (Staging)   │     │ (Production) │
└──────────────┘     └──────────────┘     └──────────────┘
```

| Environment | Purpose | Supabase Instance | Build Profile |
|-------------|---------|-------------------|---------------|
| **Local** | Developer workstation | Shared dev project | `expo start` |
| **Demo** | Client preview, QA | Staging project | `eas build --profile preview` |
| **Live** | Production users | Production project | `eas build --profile production` |

---

## 2. Prerequisites

### Development Machine
- **Node.js** ≥ 18.x (LTS)
- **npm** ≥ 9.x
- **Expo CLI** — `npm install -g expo-cli`
- **EAS CLI** — `npm install -g eas-cli`
- **Git** — Version control
- **Android Studio** — For Android emulator (optional, EAS Build can be used instead)
- **Xcode** — For iOS simulator (macOS only)

### Accounts
- **Expo/EAS Account** — For cloud builds and OTA updates
- **Supabase Account** — For database and auth
- **Apple Developer Account** — For iOS App Store distribution
- **Google Play Console** — For Android distribution

---

## 3. Initial Setup (Server Recreation)

### Step 1: Clone Repository
```bash
git clone <repository-url>
cd mobile-repair-app
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Environment
```bash
cp .env.example .env
# Edit .env with your Supabase credentials:
# EXPO_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
# EXPO_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

### Step 4: Setup Supabase Database
1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Navigate to SQL Editor
3. Run the contents of `supabase/schema.sql`
4. Verify all tables are created with RLS enabled
5. Copy the project URL and anon key to `.env`

### Step 5: Start Development Server
```bash
npx expo start
```

### Step 6: Connect Device/Emulator
- **Android:** Scan QR code with Expo Go app
- **iOS:** Scan QR code with camera (macOS) or use Expo Go
- **Emulator:** Press `a` for Android, `i` for iOS

---

## 4. Build & Distribution

### Development Build (APK for Testing)

```bash
# Configure EAS (first time only)
eas login
eas build:configure

# Build Android APK
eas build -p android --profile preview

# Build iOS Simulator
eas build -p ios --profile preview
```

### Production Build

```bash
# Android (AAB for Play Store)
eas build -p android --profile production

# iOS (IPA for App Store)
eas build -p ios --profile production
```

### EAS Configuration (`eas.json`)

```json
{
  "cli": { "version": ">= 3.0.0" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "android": { "buildType": "apk" },
      "distribution": "internal"
    },
    "production": {
      "android": { "buildType": "app-bundle" }
    }
  }
}
```

---

## 5. Database Migrations

### Adding a New Table
1. Write the SQL in a new migration file: `supabase/migrations/YYYYMMDD_description.sql`
2. Test locally against a Supabase project
3. Apply to staging: Run SQL in Supabase SQL Editor (staging project)
4. Verify with test data
5. Apply to production: Run SQL in Supabase SQL Editor (production project)
6. Update `supabase/schema.sql` with the complete schema

### Schema Change Checklist
- [ ] New table has `created_at`, `updated_at`, `deleted_at`
- [ ] UUID primary key with `uuid_generate_v4()`
- [ ] Foreign keys with appropriate `ON DELETE` behavior
- [ ] Indexes on foreign keys and frequently queried columns
- [ ] RLS enabled with appropriate policies
- [ ] `update_updated_at` trigger applied
- [ ] TypeScript types updated in `src/types/index.ts`
- [ ] Service layer updated with CRUD methods

---

## 6. Version Control Strategy

Per Master Guidelines Phase 4: Git Flow branching.

```
main          ────●────●────●────●────── (production releases)
                  │         │
demo          ────●────●────●────────── (staging/demo server)
                  │    │
feature/*     ────●────●─────────────── (individual features)
```

### Rules
- **Never** push directly to `main` without peer review
- Feature branches: `feature/auth-service`, `feature/invoice-lock`
- Hotfix branches: `hotfix/rls-policy-fix`
- All merges via Pull Request with code review

---

## 7. Monitoring & Logging

### Application Level
- **Sentry** — Error tracking and crash reporting (future integration)
- **Console logging** — Structured logs via service layer
- **Audit trails** — All business-critical actions logged to database

### Infrastructure Level
- **Supabase Dashboard** — Database performance, auth metrics, storage usage
- **UptimeRobot** — API endpoint availability monitoring (future)

---

## 8. Backup Strategy

Per Master Guidelines Phase 10:

| Backup Type | Frequency | Retention | Method |
|-------------|-----------|-----------|--------|
| Database (Supabase) | Daily (automatic) | 7 days (free), 30 days (pro) | Supabase built-in |
| Pre-deployment | Before every production deploy | 30 days | Manual SQL dump |
| Code | Every commit | Indefinite | Git repository |

### Manual Backup (Pre-Deployment)
```bash
# Export database via Supabase CLI
supabase db dump --project-ref <project-ref> > backup_$(date +%Y%m%d).sql
```

---

## 9. Rollback Procedures

### Code Rollback
```bash
# Identify the last good commit
git log --oneline -10

# Revert to previous version
git revert <commit-hash>
git push origin main

# Rebuild
eas build -p android --profile production
```

### Database Rollback
1. Identify the issue via audit trails
2. Restore from Supabase's point-in-time recovery (Pro plan)
3. Or manually undo changes using SQL

---

## 10. Security Checklist (Pre-Deployment)

- [ ] `.env` is in `.gitignore` (never committed)
- [ ] No secrets in source code
- [ ] Supabase `service_role` key is NOT in client code
- [ ] RLS is enabled on ALL tables
- [ ] RLS policies cover all CRUD operations
- [ ] Email confirmation enabled in Supabase Auth
- [ ] Rate limiting configured in Supabase
- [ ] HTTPS enforced (Supabase default)
