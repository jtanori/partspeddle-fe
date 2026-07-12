# Operations Environment Variable Mapping

This document maps the generic environment variables required by operational scripts to the stage-specific keys defined in `.env.staging` and `.env.production`.

## Staging

| Operational variable                | Source file    | Source key                      |
| ----------------------------------- | -------------- | ------------------------------- |
| `STAGING_SUPABASE_PROJECT_ID`       | `.env.staging` | `SUPABASE_PROJECT_REF`          |
| `STAGING_SUPABASE_ACCESS_TOKEN`     | `.env.staging` | `SUPABASE_PAT`                  |
| `STAGING_SUPABASE_SERVICE_ROLE_KEY` | `.env.staging` | `SUPABASE_SERVICE_ROLE_KEY`     |
| `STAGING_SUPABASE_ANON_KEY`         | `.env.staging` | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |

## Production

| Operational variable                   | Source file       | Source key                      |
| -------------------------------------- | ----------------- | ------------------------------- |
| `PRODUCTION_SUPABASE_PROJECT_ID`       | `.env.production` | `SUPABASE_PROJECT_REF`          |
| `PRODUCTION_SUPABASE_ACCESS_TOKEN`     | `.env.production` | `SUPABASE_PAT`                  |
| `PRODUCTION_SUPABASE_SERVICE_ROLE_KEY` | `.env.production` | `SUPABASE_SERVICE_ROLE_KEY`     |
| `PRODUCTION_SUPABASE_ANON_KEY`         | `.env.production` | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |

## Usage

Source the relevant `.env.*` file before running operational commands, or export the mapped variables explicitly:

```bash
set -a && source .env.staging && set +a
export STAGING_SUPABASE_PROJECT_ID=$SUPABASE_PROJECT_REF
export SUPABASE_ACCESS_TOKEN=$SUPABASE_PAT
```

For scripts that accept both staging and production via a single `SUPABASE_ACCESS_TOKEN` variable, use the token that corresponds to the target environment.
