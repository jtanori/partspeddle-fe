# platform/deployment

Deployment configuration and runbooks for the PartsPeddle platform.

## Layout

| Directory | Purpose |
|---|---|
| `fly/` | Fly.io application configuration (`fly.stage.toml`, `fly.prod.toml`). |

## Notes

- `fly.toml` paths are referenced from the repository root by CI and local deploy scripts.
- The Dockerfile path is configured in `fly.toml` and overridden on the command line.

## Status

Phase 4 complete. Fly.io configs migrated here from the root `fly/` directory.
