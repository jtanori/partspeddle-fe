# VinTrack Search Platform – Infrastructure Inventory

## 1. Application Layer

- **Provider**: Fly.io
- **Application Names**:
  - `vintrack-stage` (staging)
  - `vintrack-prod` (production)
- **Region**: `sjc`
- **Health Check**: `GET /api/health`
- **Configuration Files**:
  - Staging: `platform/deployment/fly/fly.stage.toml`
  - Production: `platform/deployment/fly/fly.prod.toml`

## 2. Database Layer

- **Provider**: Supabase
- **Environment Separation**:
  - Dedicated projects for Staging and Production.
- **Connection Strategy**: Uses `supabase-admin` (Service Role Key) for backend modules and `supabase` (Anon Key) for client-side interactions.

## 3. Search Layer

- **Provider**: Algolia
- **Application**: `vintrack-search-app`
- **Index Naming**:
  - `vintrack_parts_v1` (prod)
  - `vintrack_parts_staging` (stage)
- **Configuration**: Managed via `platform/scripts/algolia/configure-algolia-index.ts`.

## 4. Required Secrets

| Component      | Variable                                                         |
| :------------- | :--------------------------------------------------------------- |
| **Supabase**   | `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` |
| **Algolia**    | `ALGOLIA_APP_ID`, `ALGOLIA_ADMIN_KEY`, `ALGOLIA_SEARCH_KEY`      |
| **Monitoring** | `SENTRY_DSN`                                                     |

## 5. Deployment

Deployments are triggered automatically by `.github/workflows/ci.yml` on pushes to `develop` (staging) and `main` (production).

Local fallback commands:

```bash
# Staging
pnpm deploy:staging
# or
bash platform/scripts/deployment/deploy.sh staging

# Production
pnpm deploy:production
# or
bash platform/scripts/deployment/deploy.sh production
```

_(Always deploy production from the `main` branch and staging from the `develop` branch.)_

The app is containerized with `platform/docker/Dockerfile`; Fly.io is configured to use it via `[build] dockerfile` in `fly.toml` and the `--dockerfile` flag in CI.

## 6. Custom Domains

| Environment | Fly.io App       | Domain                |
| :---------- | :--------------- | :-------------------- |
| Staging     | `vintrack-stage` | `stage.partspeddle.com` |
| Production  | `vintrack-prod`  | `partspeddle.com`     |

### DNS Records

Add the following records at your DNS provider:

**Staging — `stage.partspeddle.com`**
```
A     stage.partspeddle.com      66.241.124.238
AAAA  stage.partspeddle.com      2a09:8280:1::13a:3cf3:0
```

**Production — `partspeddle.com`**
```
A     partspeddle.com            66.241.124.237
AAAA  partspeddle.com            2a09:8280:1::13a:7b9a:0
```

After adding the records, verify certificate issuance with:

```bash
flyctl certs check stage.partspeddle.com --config platform/deployment/fly/fly.stage.toml
flyctl certs check partspeddle.com --config platform/deployment/fly/fly.prod.toml
```
