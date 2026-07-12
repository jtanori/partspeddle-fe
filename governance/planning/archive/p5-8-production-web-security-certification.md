# P5.8 — Production Web Security Certification

**Branch:** `feat/p5-8-production-security-certification`  
**Base:** `develop`  
**Goal:** Run the final security gate before production traffic: automated tests, manual spot checks, and a signed PRC certification artifact.

---

## Current State

- `docs/PRC.md` contains a Production Readiness Certification template with Section 11 covering security.
- `tests/security/search/security-search.spec.ts` exists but only covers search query safety and size limits.
- P2.9 added baseline security headers via `next.config.ts`.
- P5.1–P5.7 will deliver the route, auth, API, data-access, secrets, frontend, and database hardening needed for certification.
- No consolidated security test suite, manual checklist, or sign-off artifact exists yet.

---

## Gaps

1. PRC Section 11 checkboxes are empty; no evidence links.
2. No automated security header regression suite.
3. No automated RBAC/API auth negative tests.
4. No IDOR / tenant-isolation tests.
5. No secrets-in-bundle or secrets-in-logs tests.
6. No OWASP Top 10 oriented test coverage (broken access control, injection, SSRF, misconfiguration).
7. Manual spot checks are not documented or recorded.
8. CI does not run a dedicated security test job.

---

## Work Items

### 1. Expand `tests/security/`

Create subdirectories and tests:

```text
tests/security/
  headers/security-headers.spec.ts
  rbac/protected-routes.spec.ts
  api/api-auth-negative.spec.ts
  idor/listing-isolation.spec.ts
  idor/seller-inventory-isolation.spec.ts
  idor/admin-reindex-authorization.spec.ts
  secrets/secrets-in-logs.spec.ts
  secrets/secrets-in-bundle.spec.ts
  owasp/ssrf-gemini.spec.ts
  owasp/injection-search.spec.ts
  owasp/security-misconfiguration.spec.ts
```

### 2. Security header regression tests

- Assert `Content-Security-Policy`, `Strict-Transport-Security`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, and `Permissions-Policy` are present on public, auth, seller, and admin routes.
- Assert CSP does not contain `'unsafe-inline'` for scripts after P5.6 (or is justified with nonces/hashes).
- Assert HSTS `max-age` is at least `63072000` with `includeSubDomains; preload`.

### 3. RBAC negative tests

- Anonymous user accessing `/dashboard`, `/seller`, `/admin` is redirected to `/login`.
- Buyer role accessing `/seller` is redirected to `/dashboard`.
- Buyer/seller role accessing `/admin` is redirected to `/dashboard`.
- Logged-in user accessing `/login` is redirected away.

### 4. API auth negative tests

- `GET /api/seller/inventory` without session → 401.
- `GET /api/seller/inventory` with buyer session → 403.
- `POST /api/admin/search/reindex` without session → 401.
- `POST /api/admin/search/reindex` with seller/buyer session → 403.
- `POST /api/gemini/identify` without session → 401 (after P5.3).

### 5. IDOR / tenant-isolation tests

- Seller A cannot fetch Seller B’s inventory via `/api/seller/inventory` (after P5.2/P5.4).
- Anon user cannot access `/listing/[id]` for a non-`AVAILABLE` part unless authorized.
- Buyer cannot trigger admin reindex.
- Authenticated user cannot read another user’s conversations/messages.

### 6. Secrets exposure tests

- Run the bundle-audit script from P5.5 against the production build output; assert no `ALGOLIA_ADMIN_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, or `GEMINI_API_KEY` strings.
- Trigger API errors and assert response bodies do not contain stack traces, SQL, or secret names.
- Inspect logs/spans and assert tokens/keys are redacted.

### 7. OWASP-oriented tests

- **Broken access control:** covered by RBAC and IDOR tests above.
- **Injection:** verify search API safely handles SQL/NoSQL injection payloads (existing search spec).
- **SSRF:** verify `/api/gemini/identify` rejects internal/private network URLs and non-image payloads.
- **Security misconfiguration:** verify `/api/health` does not expose internal versions/keys; verify `next.config.ts` does not leak `serverRuntimeConfig` secrets.

### 8. Manual spot-check checklist

Create `docs/SECURITY_MANUAL_CHECKS.md` with a checklist:

- [ ] IDOR on `/listing/[id]` for draft/sold parts.
- [ ] Seller inventory isolation in the UI.
- [ ] Admin reindex authorization in the admin dashboard.
- [ ] Password reset flow cannot be abused.
- [ ] File upload only accepts images and respects size limits.
- [ ] Cookie flags in browser DevTools (`HttpOnly`, `Secure`, `SameSite`).
- [ ] Third-party script origins in CSP.

Record evidence (screenshots, curl output, HAR files) and link from `docs/PRC.md`.

### 9. Fill `docs/PRC.md` Section 11

- Mark each checkbox with evidence links:
  - CSP/HSTS → `tests/security/headers/security-headers.spec.ts`
  - Secrets → `tests/security/secrets/*`
  - Dependency audit → CI run link with `pnpm audit --production` output
  - Manual checks → `docs/SECURITY_MANUAL_CHECKS.md`

### 10. Add CI security job

In `.github/workflows/ci.yml`, add a `security` job:

```yaml
security:
  name: Security Tests
  needs: test
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: '22'
    - run: corepack enable
    - run: pnpm install
    - run: pnpm test -- tests/security
    - run: pnpm security:bundle-audit
    - run: pnpm audit --production
```

### 11. Sign-off artifact

At the end of the branch, fill the PRC certification block:

- Version, branch, environment, auditor, date, result.
- Final scorecard with PASS/CONDITIONAL PASS/FAIL per category.
- Release authorization signature.

---

## Acceptance Criteria

- [ ] `tests/security/` covers headers, RBAC, API auth, IDOR, secrets, and OWASP items.
- [ ] Manual spot-check checklist is documented and evidence is linked.
- [ ] `docs/PRC.md` Section 11 is filled with evidence links.
- [ ] CI runs a dedicated security job.
- [ ] `pnpm audit --production` passes.
- [ ] All security tests pass.
- [ ] PRC certification block is completed and signed off.

---

## Dependencies

- **Blocked by:** P5.1–P5.7.
- **Unblocks:** Final `develop → main` merge and production launch.

---

## Risks

- Certification may surface late-breaking issues that require reopening earlier phases; budget time for remediation.
- Manual checks depend on staging environment stability; schedule them after staging deploy smoke tests pass.
- Security tests that exercise the real database must run in an isolated test environment to avoid polluting production data.
