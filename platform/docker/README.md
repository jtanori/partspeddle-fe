# platform/docker

Docker and container configuration for the PartsPeddle platform.

## Layout

| File | Purpose |
|---|---|
| `Dockerfile` | Production-ready Next.js standalone image. |
| `.dockerignore` | Stayed at the repository root because Docker requires it at the build-context root. |

## Notes

- `.dockerignore` remains at repository root (`/.dockerignore`) because Docker only recognizes it at the root of the build context.
- `fly.toml` files reference this Dockerfile via `[build] dockerfile = "platform/docker/Dockerfile"`.
- CI and local deploy commands pass `--dockerfile platform/docker/Dockerfile` explicitly.

## Status

Phase 4 complete. Dockerfile migrated here from the repository root.
