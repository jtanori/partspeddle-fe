# Required Environment Variables

Auto-generated from `config/environment/schema.ts`.

## Runtime

| Variable                        | Description                                                      | Scope          | Required | Secret | Default |
| ------------------------------- | ---------------------------------------------------------------- | -------------- | -------- | ------ | ------- |
| `APP_URL`                       | Canonical application URL used by server-side code and metadata. | server-runtime | Yes      | No     | —       |
| `SUPABASE_URL`                  | Supabase project URL used by server-side code.                   | server-runtime | Yes      | No     | —       |
| `SUPABASE_ANON_KEY`             | Supabase anon key used by server-side code.                      | server-runtime | Yes      | Yes    | —       |
| `SUPABASE_SERVICE_ROLE_KEY`     | Supabase service-role key used by server-side code (privileged). | server-runtime | Yes      | Yes    | —       |
| `ALGOLIA_APP_ID`                | Algolia application ID used for server-side admin operations.    | server-runtime | Yes      | No     | —       |
| `ALGOLIA_ADMIN_KEY`             | Algolia admin API key used by server-side code.                  | server-runtime | Yes      | Yes    | —       |
| `GEMINI_API_KEY`                | Google Gemini API key used by server-side AI features.           | server-runtime | Yes      | Yes    | —       |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase project URL exposed to the browser.                     | public-runtime | Yes      | No     | —       |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key exposed to the browser.                        | public-runtime | Yes      | Yes    | —       |

## CI / Deploy

| Variable                         | Description                                                        | Scope     | Required | Secret | Default |
| -------------------------------- | ------------------------------------------------------------------ | --------- | -------- | ------ | ------- |
| `FLY_API_TOKEN`                  | Fly.io API token used by GitHub Actions to deploy applications.    | ci-deploy | Yes      | Yes    | —       |
| `SUPABASE_ACCESS_TOKEN`          | Supabase personal access token used by GitHub Actions and the CLI. | ci-deploy | Yes      | Yes    | —       |
| `STAGING_SUPABASE_PROJECT_ID`    | Staging Supabase project reference ID.                             | ci-deploy | Yes      | No     | —       |
| `PRODUCTION_SUPABASE_PROJECT_ID` | Production Supabase project reference ID.                          | ci-deploy | Yes      | No     | —       |

## Smoke Tests

| Variable                            | Description                                            | Scope      | Required | Secret | Default |
| ----------------------------------- | ------------------------------------------------------ | ---------- | -------- | ------ | ------- |
| `STAGING_URL`                       | Staging application URL used by smoke tests.           | smoke-test | Yes      | No     | —       |
| `STAGING_SUPABASE_URL`              | Staging Supabase URL used by smoke tests.              | smoke-test | Yes      | No     | —       |
| `STAGING_SUPABASE_ANON_KEY`         | Staging Supabase anon key used by smoke tests.         | smoke-test | Yes      | Yes    | —       |
| `STAGING_SUPABASE_SERVICE_ROLE_KEY` | Staging Supabase service-role key used by smoke tests. | smoke-test | Yes      | Yes    | —       |
