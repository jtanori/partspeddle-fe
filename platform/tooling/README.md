# platform/tooling

Development tooling configuration for the PartsPeddle platform.

## Layout

| File | Purpose |
|---|---|
| `lint-staged.config.js` | lint-staged configuration (extracted from `package.json`). |
| `pre-commit.sh` | Pre-commit hook logic delegated from `.husky/pre-commit`. |
| `commit-msg.sh` | Commit-msg hook logic delegated from `.husky/commit-msg`. |

## Notes

- Husky still manages hooks from `.husky/`, but the hook scripts delegate here.
- `package.json` references `lint-staged.config.js` via `"lint-staged": "platform/tooling/lint-staged.config.js"`.

## Status

Phase 4 complete. lint-staged config extracted and husky hooks delegated.
