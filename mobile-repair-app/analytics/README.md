# Analytics

> Configuration and documentation for analytics tracking.

## Current Implementation

Analytics data is computed server-side via the `analytics-service.ts` which runs aggregate queries against Supabase:

| Metric | Source | Dashboard |
|---|---|---|
| Monthly Revenue | `invoices` table (status=paid) | Tenant Dashboard |
| Active Jobs | `jobs` table (status != completed/cancelled) | Tenant + Technician |
| Technician Count | `users` table (role=technician) | Tenant Dashboard |
| Completion Rate | `jobs` completed / total | Tenant Dashboard |
| Daily Earnings | `invoices` by technician | Technician HUD |

## Planned Integrations (V2)

| Tool | Purpose |
|---|---|
| Firebase Analytics | User behavior tracking, retention |
| Mixpanel | Funnel analysis, feature adoption |
| Google Analytics | Web admin panel |

## Event Tracking Schema

```typescript
// Events to track in V2:
'app.opened'
'booking.started'
'booking.completed'
'job.status_changed'
'invoice.created'
'invoice.locked'
'notification.tapped'
'settings.notification_toggled'
```
