# RTK Shell Optimization

Shell commands in this project are routed through `rtk`, a high-performance CLI proxy that compresses verbose output by 60-90%.

## Common Mappings

| Raw Command                  | RTK Equivalent                |
| ---------------------------- | ----------------------------- |
| `ls`, `ls -la`, `tree`       | `rtk ls .`                    |
| `cat`, `head`, `tail`        | `rtk read <file>`             |
| `grep -r`, `rg`              | `rtk grep "<pattern>" <path>` |
| `find`                       | `rtk find "<pattern>" <path>` |
| `git status`                 | `rtk git status`              |
| `git diff`                   | `rtk git diff`                |
| `git log`                    | `rtk git log -n <N>`          |
| `git add/commit/push/pull`   | `rtk git <subcommand>`        |
| `npm test`, `vitest`, `jest` | `rtk vitest` / `rtk jest`     |
| `pytest`                     | `rtk pytest`                  |
| `cargo test`                 | `rtk cargo test`              |
| `go test`                    | `rtk go test`                 |
| `docker ps`                  | `rtk docker ps`               |
| `docker logs`                | `rtk docker logs <c>`         |
| `docker compose ps`          | `rtk docker compose ps`       |
| `kubectl get pods`           | `rtk kubectl pods`            |
| `kubectl logs`               | `rtk kubectl logs <pod>`      |
| `curl`                       | `rtk curl <url>`              |
| `env`                        | `rtk env`                     |
| `aws ...`                    | `rtk aws ...`                 |

## Aggressive Compression

For very large outputs:

```bash
rtk read file.ts -l aggressive
rtk smart file.ts
rtk ls . -u
rtk git status -u
```

## Fallback Rule

If an `rtk`-prefixed command fails with an RTK-specific error, retry without the `rtk` prefix and note the fallback.
