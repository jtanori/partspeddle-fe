# platform/scripts

Automation and operational scripts for the PartsPeddle platform.

## Layout

| Directory | Purpose |
|---|---|
| `algolia/` | Algolia index configuration scripts. |
| `archive/` | Historical / one-off scripts kept for reference. |
| `bootstrap/` | Environment seed scripts. |
| `ci/` | CI-specific helpers (e.g., smoke tests). |
| `deployment/` | Deploy, verification, and env validation scripts. |
| `dev/` | Local development helpers. |
| `generators/` | Code generators. |
| `maintenance/` | Cleanup, archive, and drift checks. |
| `migration/` | Database migration and drift helpers. |
| `scgs/` | SCGS certification scripts. |
| `search/` | Search worker and audit scripts. |
| `security/` | Security audit and env-check scripts. |
| `tooling/` | Lint, format, and build helpers. |

## Status

Phase 4 complete. All scripts migrated here from the root `scripts/` directory.
