# P5.5 — Secrets, Environment, and Sensitive Data Exposure

**Branch:** `feat/p5-5-secrets-env-sensitive-data`  
**Base:** `develop`  
**Goal:** Ensure server secrets never leak to the browser, logs, or error responses, and that required secrets are validated at build/start time.

---

## Current State

- `.env.example` already classifies variables as `NEXT_PUBLIC_*` (browser-safe), server-only, or CI/deploy-only.
- No runtime validation ensures required production secrets are present before the app starts.
- `src/lib/logger.ts` logs arbitrary context objects without redacting tokens, PII, or secrets.
- Error responses from API routes are mostly generic, but there is no enforced scrubbing standard.
- CI runs GitGuardian, but there is no `pnpm audit --production` gate.
- Production Fly.io secrets were addressed in P3.5; staging and production secrets are separate.

---

## Gaps

1. Missing build/start-time validation for required server secrets.
2. No automated client-bundle audit proving server secrets are absent from `/.next/static`.
3. Logger context may include sensitive values (tokens, service-role keys, user emails, phone numbers).
4. OpenTelemetry spans may capture unredacted request bodies or query strings.
5. No `pnpm audit --production` gate in CI.
6. Secret rotation steps are not documented in `docs/DEPLOYMENT_RUNBOOK.md`.

---

## Work Items

### 1. Add runtime environment validation

Create `src/lib/env.ts` that loads and validates environment variables at import time (for server code) and during `next build`:

- Required server-only variables:
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `ALGOLIA_APP_ID`
  - `ALGOLIA_ADMIN_KEY`
  - `GEMINI_API_KEY`
- Required browser-safe variables:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Optional with defaults:
  - `ALGOLIA_SEARCH_INDEX_NAME` (default `parts`)

Throw at startup if a required variable is missing/empty in production. In development, warn but allow placeholders.

### 2. Audit and block secrets in the client bundle

- Add a build-time script `scripts/security/audit-client-bundle.ts` that scans `.next/static/**` and the serverless function output for forbidden substrings:
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `ALGOLIA_ADMIN_KEY`
  - `GEMINI_API_KEY`
  - Known placeholder values from `.env.example`
- Run it in CI after `pnpm build` and fail the job if any match is found.
- For local checks, add a `pnpm security:bundle-audit` script.

### 3. Redact sensitive data in logs and spans

Update `src/lib/logger.ts`:

- Add a `redact(value: unknown)` helper that recursively scrubs keys such as:
  - `token`, `jwt`, `apiKey`, `api_key`, `secret`, `password`, `service_role`, `serviceRole`, `authorization`, `cookie`, `email`, `whatsapp`, `phone`, `taxId`.
- Apply redaction to both `info` and `error` context objects.
- Never log full request bodies from `/api/seller/assets/upload`, `/api/gemini/identify`, or auth callbacks.

If OpenTelemetry auto-instrumentation captures HTTP request attributes, add a span processor or Next.js instrumentation hook to redact `http.request.header.authorization` and `http.request.header.cookie`.

### 4. Standardize safe error responses

Add `src/lib/api/errors.ts`:

- `safeErrorResponse(error, status)` returns `{ error: "..." }` to the client with a generic message.
- Internal details (stack, Supabase error message, secret names) are logged server-side only.
- Apply to all `/api/**` routes (can be done incrementally; start with seller/admin/search routes).

### 5. Add dependency audit gate to CI

In `.github/workflows/ci.yml`, after `pnpm install` and before tests, add:

```yaml
- name: Dependency audit
  run: pnpm audit --production
```

Document the expected behavior: fail on `critical`/`high` severity; moderate/low can be allowed with an explicit ignore list in `pnpm-audit-exceptions.json`.

### 6. Document secret rotation

Update `docs/DEPLOYMENT_RUNBOOK.md` with:

- Where each secret is stored (Fly.io, GitHub Actions, Supabase dashboard).
- Rotation steps per service (Supabase JWT, Algolia API key, Gemini API key, webhook secret).
- How to verify rotation succeeded (smoke tests, health checks).

### 7. Add branch tests

Under `tests/branch/p5-5-secrets-env-sensitive-data/`:

- `env-validation.test.ts` — required variables fail validation when empty.
- `logger-redaction.test.ts` — logger redacts tokens, secrets, and PII.
- `error-safety.test.ts` — API error responses do not include internal details.
- `bundle-audit.test.ts` — placeholder secret strings are not present in a mock build output (or run the real audit script).

---

## Acceptance Criteria

- [ ] `src/lib/env.ts` validates required server and public env vars at startup/build time.
- [ ] Client bundle audit script exists and runs in CI.
- [ ] Logger redacts tokens, secrets, and PII from context.
- [ ] API routes use a standardized safe-error helper that does not leak internals.
- [ ] CI runs `pnpm audit --production` and fails on critical/high vulnerabilities.
- [ ] `docs/DEPLOYMENT_RUNBOOK.md` includes secret rotation procedures.
- [ ] Branch tests cover env validation, logger redaction, error safety, and bundle audit.
- [ ] `pnpm test`, `pnpm lint`, and `pnpm typecheck` pass.

---

## Dependencies

- **Blocked by:** P5.4 (data-access paths known; service-role usage cataloged).
- **Unblocks:** P5.8 (security certification), P6.7 (remote migration and JWT rotation).

---

## Risks

- Strict env validation may break local development if placeholders are missing; keep a clear `.env.example` and local override path.
- Bundle-audit false positives can occur if minified code accidentally contains a secret-like substring; use exact key-value or prefix matching and allow an explicit allowlist.
- Redacting too aggressively in logs can hinder debugging; keep original values in server logs behind a `debug` flag that is disabled in production.
