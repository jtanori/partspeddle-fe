# Environment Governance System (EGS)

This directory is the single source of truth for all environment variables used by PartsPeddle / VinTrack.

## Files

| File                    | Purpose                                                                                                 |
| ----------------------- | ------------------------------------------------------------------------------------------------------- |
| `schema.ts`             | Canonical definitions: name, description, scope, secret flag, required flag, Zod schema, default value. |
| `classify.ts`           | Helper functions for filtering variables by scope, required/optional, secret/public.                    |
| `validate.ts`           | Validation functions for different contexts (runtime, CI deploy, smoke test, all).                      |
| `generated/required.md` | Auto-generated list of required variables by scope.                                                     |
| `generated/public.md`   | Auto-generated list of public/browser variables.                                                        |
| `generated/secrets.md`  | Auto-generated list of secret variables.                                                                |

## Scopes

- **server-runtime** — Next.js server / API routes / server components.
- **public-runtime** — Next.js client / browser (must be prefixed with `NEXT_PUBLIC_`).
- **ci-deploy** — GitHub Actions, Fly.io deploy, Supabase CLI. Not available at runtime.
- **smoke-test** — Operational validation against staging or production.
- **development** — Local development / test utilities only.

## Production-specific notes

The GitHub `production` environment now includes Algolia secrets (`ALGOLIA_APP_ID`, `ALGOLIA_ADMIN_KEY`, `ALGOLIA_SEARCH_INDEX_NAME`) so the production health check can validate the production Algolia index during deploy verification.

## Scripts

```bash
# Validate runtime environment (used in CI and local startup)
pnpm env:validate

# Validate CI/deploy environment
pnpm env:validate ci-deploy

# Validate smoke-test environment
pnpm env:validate smoke-test

# Regenerate generated/*.md
pnpm env:report
```

## Adding or changing a variable

1. Edit `schema.ts`.
2. Set `secret: true` if the value must never be committed or logged.
3. Set `scope` to the smallest scope that consumes the variable.
4. Run `pnpm env:report` to update generated docs.
5. Update `docs/operations/secret-governance.md` if storage location changes.

## Runtime behavior

`src/lib/env.ts` derives its server/public schemas from `schema.ts`. In production,
missing or invalid required variables cause the application to throw at startup. In
development, a warning is logged instead.
