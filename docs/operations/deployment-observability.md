# Deployment Observability

This document describes how PartsPeddle / VinTrack records and tracks deployments.

---

## Purpose

Every delivery to staging or production should leave a durable record that can be used for:

- tracing a deployment back to a specific commit,
- measuring pipeline and deploy duration,
- verifying which verification steps passed,
- supporting rollback decisions.

## Deployment artifact

After a production promotion, a JSON artifact is written to:

```text
artifacts/delivery/production-deployment-<YYYY-MM-DD>.json
```

### Schema

| Field                         | Type   | Description                                                                 |
| ----------------------------- | ------ | --------------------------------------------------------------------------- |
| `sha`                         | string | Git SHA that was deployed.                                                  |
| `branch`                      | string | Branch that triggered the deployment (e.g., `main`).                        |
| `environment`                 | string | Target environment (`staging` or `production`).                             |
| `appUrl`                      | string | Canonical application URL.                                                  |
| `runUrl`                      | string | Link to the GitHub Actions run.                                             |
| `runId`                       | number | GitHub Actions run ID.                                                      |
| `runNumber`                   | number | GitHub Actions run number.                                                  |
| `startedAt`                   | string | ISO 8601 pipeline start time.                                               |
| `completedAt`                 | string | ISO 8601 pipeline completion time.                                          |
| `pipelineDurationSeconds`     | number | Total pipeline duration in seconds.                                         |
| `deployDurationSeconds`       | number | Time spent deploying Fly and Supabase.                                      |
| `verificationDurationSeconds` | number | Time spent on health checks and smoke tests.                                |
| `health`                      | string | Health result (`healthy`, `degraded`, `unhealthy`).                         |
| `contractVersion`             | string | Version of the health contract that passed.                                 |
| `deployedServices`            | object | Service names, e.g. `{ "fly": "vintrack-prod", "supabase": "production" }`. |
| `jobs`                        | object | Map of CI job names to outcomes (`success`, `failure`, `skipped`).          |
| `notes`                       | array  | Human-readable notes about the deployment.                                  |

### Example

```json
{
  "sha": "9b3d3bcfc018b86c94eabfcc7f9d1bee1b0a6cbf",
  "branch": "main",
  "environment": "production",
  "appUrl": "https://partspeddle.com",
  "runUrl": "https://github.com/jtanori/partspeddle-fe/actions/runs/29169472375",
  "runId": 29169472375,
  "runNumber": 409,
  "startedAt": "2026-07-11T21:50:06Z",
  "completedAt": "2026-07-11T21:55:42Z",
  "pipelineDurationSeconds": 336,
  "deployDurationSeconds": 93,
  "verificationDurationSeconds": 23,
  "health": "healthy",
  "contractVersion": "1.0.0",
  "deployedServices": {
    "fly": "vintrack-prod",
    "supabase": "production"
  },
  "jobs": {
    "test": "success",
    "storybook": "success",
    "security": "success",
    "deploySupabase": "success",
    "deployFly": "success",
    "smokeTests": "success"
  },
  "notes": [
    "Final production deployment with strict Algolia health check.",
    "Production Algolia index was created via pnpm algolia:config using the production credentials."
  ]
}
```

## Canonical manifest

The delivery manifest at `platform/operations/delivery/manifests/delivery.manifest.json` defines:

- environments and their metadata,
- the verification sequence,
- the health contract schema,
- the intended deployment-records directory.

CI, verification scripts, and documentation should derive operational facts from this manifest where practical.

## Future improvements

- Emit one artifact per environment (staging and production) on every delivery.
- Include the Docker image digest and Fly.io release version.
- Move generated artifacts into `artifacts/deployments/` as declared in the manifest.
- Add a small CLI (`pnpm delivery:artifact:show`) to print the latest artifact.
