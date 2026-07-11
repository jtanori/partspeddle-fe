# RTK Shell Command Mappings

This project uses RTK to compress verbose shell output. Prefix supported commands with `rtk` as shown below.

## Detection

```bash
which rtk && rtk --version
```

If RTK is not installed, fall back to raw shell commands.

## Mappings

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

## Commands That Stay Raw

| Raw Command                        | Why Raw                                  |
| ---------------------------------- | ---------------------------------------- |
| `ps`, `top`, `htop`                | No RTK filter exists                     |
| `df`, `free`, `du`                 | Already minimal output                   |
| `mkdir`, `touch`, `rm`, `mv`, `cp` | No output or trivial output              |
| `echo`, `printf`                   | Already minimal                          |
| `chmod`, `chown`                   | No output or trivial output              |
| `npm install`, `pnpm install`      | Progress bars; low value to compress     |
| short custom scripts               | Custom one-liners without verbose output |

## Aggressive Compression

Use for very large outputs (>200 lines), explicit token-minimization requests, or large generated files:

```bash
# Code files: signatures only, strip bodies
rtk read file.ts -l aggressive

# Smart 2-line summary of a file
rtk smart file.ts

# Ultra-compact output (ASCII icons, inline)
rtk ls . -u
rtk git status -u
```

## Error Handling

If an `rtk`-prefixed command fails with an RTK-specific error:

1. Retry the same command without the `rtk` prefix.
2. Log the fallback for diagnostics.
3. Do not let RTK failures block critical operations.
