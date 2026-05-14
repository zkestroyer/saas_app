# Infrastructure

> Configuration files for containerisation and deployment infrastructure.

## Current Setup
Revivix uses **Supabase** (managed PostgreSQL) and **EAS Build** (managed CI/CD) — no self-hosted infrastructure is needed for V1.

## Directory Structure (for future use)

```
infrastructure/
├── docker/          # Dockerfile and docker-compose for local development
├── nginx/           # Reverse proxy configs (if self-hosting)
├── kubernetes/      # K8s manifests (for scale)
└── terraform/       # IaC for cloud provisioning
```

## Docker (Local Development)

When migrating to a self-hosted backend, add:
- `Dockerfile` for the API server
- `docker-compose.yml` for local Supabase + API + monitoring stack

## Deployment Environments

| Environment | Platform | Config |
|---|---|---|
| Development | Expo Dev Server | `npx expo start` |
| Preview | EAS Build (APK) | `eas build --profile preview` |
| Production | EAS Build (AAB/IPA) | `eas build --profile production` |
| Database | Supabase Cloud | Managed PostgreSQL |
