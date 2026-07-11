# Deployment Recovery and Rollback Runbook

This runbook covers how to respond when a deployment fails or staging/production becomes unhealthy.

## Preconditions

Before using this runbook, confirm:

- You have `flyctl` installed and authenticated.
- You have `supabase` CLI installed and authenticated.
- You have access to the GitHub repository and can view Actions logs.
- You know which environment is affected: `staging` or `production`.

## 1. Detecting a failed deployment

A deployment is considered failed when any of the following occur:

- The GitHub Actions deployment job exits with a non-zero status.
- The post-deploy health check (`pnpm ci:verify:staging` / `pnpm ci:verify:production`) times out or reports degraded status.
- Smoke tests fail after a deployment.
- The `/api/health` endpoint returns `503` or `degraded`.

## 2. Immediate response

### 2.1 Stop the pipeline

If a production deployment is in progress and the health check is failing, cancel the GitHub Actions run if possible. Do not allow downstream jobs (smoke tests, notifications) to run against a known-bad deployment.

### 2.2 Assess severity

| Symptom                           | Severity | Action                                                            |
| --------------------------------- | -------- | ----------------------------------------------------------------- |
| Staging health check fails        | Low      | Roll back staging; no user impact.                                |
| Production health check fails     | High     | Roll back production immediately.                                 |
| Smoke tests fail but health is ok | Medium   | Investigate test or data issue; do not roll back automatically.   |
| Supabase migration fails          | High     | Do not retry until cause is understood; consider schema rollback. |

## 3. Rolling back a Fly.io deployment

### Staging

```bash
# List recent releases
flyctl releases list -a vintrack-stage

# Roll back to the previous healthy release
flyctl deploy -a vintrack-stage --image-ref <previous-image-ref>
# OR use release version
flyctl releases rollback <version> -a vintrack-stage
```

### Production

```bash
# List recent releases
flyctl releases list -a vintrack-prod

# Roll back to the previous healthy release
flyctl deploy -a vintrack-prod --image-ref <previous-image-ref>
# OR use release version
flyctl releases rollback <version> -a vintrack-prod
```

After rollback:

1. Wait for the application to restart.
2. Run the health check:
   ```bash
   pnpm deploy:verify https://partspeddle.com
   # or for staging
   pnpm ci:verify:staging
   ```
3. Run smoke tests if health passes.

## 4. Rolling back Supabase migrations

Supabase migrations are **not automatically rolled back** by `supabase db push`. If a migration caused the failure:

1. Identify the failing migration in `supabase/migrations/`.
2. Write a corrective migration that reverses the change.
3. Open a PR with the corrective migration.
4. Merge and let CI deploy it.

> Never manually edit already-applied migrations on a remote database.

## 5. Investigating the failure

### GitHub Actions logs

1. Open the failed run.
2. Check the job that failed:
   - `Deploy Staging to Fly.io` or `Deploy Production to Fly.io`
   - `Deploy Supabase to Staging` / `Deploy Supabase to Production`
   - `Staging Smoke Tests`
3. Read the error and identify whether it is build, deploy, or verification related.

### Health endpoint

```bash
curl -s https://stage.partspeddle.com/api/health | jq .
# or production
curl -s https://partspeddle.com/api/health | jq .
```

Look for:

- `status: "degraded"`
- Which `checks` are failing (`environment`, `supabase`, `algolia`)
- `message` fields for specific errors

### Fly logs

```bash
flyctl logs -a vintrack-stage
flyctl logs -a vintrack-prod
```

### Supabase logs

```bash
supabase projects list
supabase inspect db --project-ref <project-ref>
```

## 6. After recovery

1. Document the incident in `artifacts/incidents/` or the team incident tracker.
2. Capture the failing commit SHA, GitHub Actions run ID, and Fly release version.
3. Create a corrective task to prevent recurrence.
4. If the issue was an environment variable, update `config/environment/schema.ts` and regenerate docs with `pnpm env:report`.

## 7. Emergency contacts

- Primary on-call: [TBD]
- Infrastructure lead: [TBD]
- Supabase project owner: [TBD]
