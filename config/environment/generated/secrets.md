# Secret Environment Variables

These variables must be stored in encrypted secret storage (Fly secrets, GitHub environment secrets, or a local `.env.local` that is never committed).

| Variable                            | Description                                                        | Scope          | Required | Secret | Default |
| ----------------------------------- | ------------------------------------------------------------------ | -------------- | -------- | ------ | ------- |
| `SUPABASE_ANON_KEY`                 | Supabase anon key used by server-side code.                        | server-runtime | Yes      | Yes    | —       |
| `SUPABASE_SERVICE_ROLE_KEY`         | Supabase service-role key used by server-side code (privileged).   | server-runtime | Yes      | Yes    | —       |
| `ALGOLIA_ADMIN_KEY`                 | Algolia admin API key used by server-side code.                    | server-runtime | Yes      | Yes    | —       |
| `GEMINI_API_KEY`                    | Google Gemini API key used by server-side AI features.             | server-runtime | Yes      | Yes    | —       |
| `SUPABASE_WEBHOOK_SECRET`           | Shared secret for validating Supabase webhooks in Edge Functions.  | server-runtime | No       | Yes    | —       |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`     | Supabase anon key exposed to the browser.                          | public-runtime | Yes      | Yes    | —       |
| `FLY_API_TOKEN`                     | Fly.io API token used by GitHub Actions to deploy applications.    | ci-deploy      | Yes      | Yes    | —       |
| `SUPABASE_ACCESS_TOKEN`             | Supabase personal access token used by GitHub Actions and the CLI. | ci-deploy      | Yes      | Yes    | —       |
| `STAGING_SUPABASE_ANON_KEY`         | Staging Supabase anon key used by smoke tests.                     | smoke-test     | Yes      | Yes    | —       |
| `STAGING_SUPABASE_SERVICE_ROLE_KEY` | Staging Supabase service-role key used by smoke tests.             | smoke-test     | Yes      | Yes    | —       |
