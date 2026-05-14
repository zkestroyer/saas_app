# Monitoring

> Configuration and documentation for application monitoring and crash reporting.

## Current Setup

| Layer | Tool | Status |
|---|---|---|
| Audit Trails | `audit-service.ts` → `audit_trails` table | ✅ Active |
| Error Logging | `console.error` + try/catch | ✅ Active |
| Crash Reporting | Sentry (planned) | 🔜 V2 |
| Performance | TanStack Query DevTools | ✅ Dev only |

## Planned: Sentry Integration

```bash
# Install (when ready)
npx expo install @sentry/react-native
```

```typescript
// app/_layout.tsx — add after imports:
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.2,
  environment: __DEV__ ? 'development' : 'production',
});
```

## Health Checks

| Check | Method | Frequency |
|---|---|---|
| Database connectivity | Supabase status page | Real-time |
| Auth service | Session restore on app start | Per launch |
| Push notifications | `registerForPushNotifications()` | Per launch |
| API response times | TanStack Query `staleTime` monitoring | Continuous |

## Alerting (V2)

| Alert | Trigger | Channel |
|---|---|---|
| High error rate | >5% API failures in 5min | Slack/Email |
| Auth failures | >10 failed logins in 1min | Slack |
| Database overload | Query time >2s | Email |
