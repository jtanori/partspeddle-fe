# VinTrack Search Platform – Infrastructure Inventory

## 1. Application Layer

- **Provider**: Fly.io
- **Application Names**:
  - `vintrack-search-staging`
  - `vintrack-search-prod`
- **Region**: `ewr` (default)
- **Health Check**: `GET /health`

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
- **Configuration**: Managed via `scripts/algolia/configure-algolia-index.ts`.

## 4. Required Secrets

| Component      | Variable                                                         |
| :------------- | :--------------------------------------------------------------- |
| **Supabase**   | `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` |
| **Algolia**    | `ALGOLIA_APP_ID`, `ALGOLIA_ADMIN_KEY`, `ALGOLIA_SEARCH_KEY`      |
| **Monitoring** | `SENTRY_DSN`                                                     |

## 5. Configuration (`fly.toml`)

_(Ensure `fly.toml` in the repository root is kept in sync with the machine requirements for the respective production/staging Fly apps.)_
