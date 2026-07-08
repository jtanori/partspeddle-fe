# RTK Shell Mappings

Shell commands in this project are RTK-optimized to reduce token usage from verbose output.

| Raw Command | RTK Equivalent |
|-------------|----------------|
| `ls`, `ls -la`, `tree` | `rtk ls .` |
| `cat`, `head`, `tail` | `rtk read <file>` |
| `grep -r`, `rg` | `rtk grep "<pattern>" <path>` |
| `find` | `rtk find "<pattern>" <path>` |
| `git status` | `rtk git status` |
| `git diff` | `rtk git diff` |
| `git log` | `rtk git log -n <N>` |
| `git add/commit/push/pull` | `rtk git <subcommand>` |
| `npm test`, `vitest`, `jest` | `rtk vitest` / `rtk jest` |
| `pytest` | `rtk pytest` |
| `cargo test` | `rtk cargo test` |
| `go test` | `rtk go test` |
| `docker ps` | `rtk docker ps` |
| `docker logs` | `rtk docker logs <c>` |
| `docker compose ps` | `rtk docker compose ps` |
| `kubectl get pods` | `rtk kubectl pods` |
| `kubectl logs` | `rtk kubectl logs <pod>` |
| `curl` | `rtk curl <url>` |
| `env` | `rtk env` |
| `aws ...` | `rtk aws ...` |

Keep raw for commands with no output/trivial output: `mkdir`, `touch`, `rm`, `mv`, `cp`, `chmod`, `chown`, `echo`, `printf`.
