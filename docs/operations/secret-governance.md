# Secret Governance Policy

This document defines where each class of environment variable must be stored.

| Storage                                                            | Use case                                                                                                |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| Repository secrets (`Settings > Secrets and variables > Actions`)  | Test-only or non-sensitive workflow inputs. Never used for staging/production runtime.                  |
| GitHub environment secrets (`staging` / `production` environments) | CI/deploy variables (`ci-deploy` scope) such as `SUPABASE_ACCESS_TOKEN`, `STAGING_SUPABASE_PROJECT_ID`. |
| Fly secrets (`fly secrets set …`)                                  | Runtime secrets consumed by the application (`server-runtime` and `public-runtime` secret variables).   |
| Local `.env.local`                                                 | Local development values. Must never be committed.                                                      |

## Classification rules

1. **Secret variables** (`secret: true` in `config/environment/schema.ts`) must never appear in repository code, logs, or generated client bundles.
2. **Public variables** (`public-runtime` scope, `NEXT_PUBLIC_*`) are embedded in the browser bundle. They must not contain secrets.
3. **CI/deploy variables** must be stored in the matching GitHub environment, not repository-level secrets, when they are environment-specific.
4. **Optional variables** with defaults must still be documented; defaults are declared in `schema.ts`.

## Required secrets by environment

### Staging Fly app (`vintrack-stage`)

- `APP_URL`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `ALGOLIA_APP_ID`
- `ALGOLIA_ADMIN_KEY`
- `ALGOLIA_SEARCH_INDEX_NAME`
- `ALGOLIA_INDEX_PRICE_ASC`
- `ALGOLIA_INDEX_PRICE_DESC`
- `ALGOLIA_INDEX_NEWEST`
- `GEMINI_API_KEY`
- `SUPABASE_WEBHOOK_SECRET` (if Edge Function webhooks are enabled)

### Production Fly app (`vintrack-prod`)

Same set as staging, with production values.

### GitHub `staging` environment

- `FLY_API_TOKEN`
- `SUPABASE_ACCESS_TOKEN`
- `STAGING_SUPABASE_PROJECT_ID`
- `STAGING_URL`
- `STAGING_SUPABASE_URL`
- `STAGING_SUPABASE_ANON_KEY`
- `STAGING_SUPABASE_SERVICE_ROLE_KEY`

### GitHub `production` environment

- `FLY_API_TOKEN`
- `SUPABASE_ACCESS_TOKEN`
- `PRODUCTION_SUPABASE_PROJECT_ID`

## Audit procedure

Run the automated drift check against the canonical schema:

```bash
pnpm delivery:verify:env-drift --env staging
pnpm delivery:verify:env-drift --env production
```

The tool compares secret *names* in Fly.io and GitHub environments against `config/environment/schema.ts` and reports:

- **Missing secrets** — required by the schema but absent from the remote store.
- **Orphaned secrets** — present in the remote store but not defined in the schema.

Values are never printed.

For manual verification, you can also list secrets directly:

```bash
fly secrets list -a vintrack-stage
fly secrets list -a vintrack-prod
gh secret list --env staging
gh secret list --env production
```

Any secret listed remotely but not in the schema is orphaned and should be removed.
Any secret in the schema but missing remotely is a deployment gap.

## Rotation

When a secret is rotated:

1. Update the value in the canonical storage location (Fly or GitHub environment).
2. Do **not** commit the new value.
3. Run smoke tests to confirm the new value is active.
4. Record the rotation date in the deployment log.
