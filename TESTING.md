# Testing — PartsPeddle / VinTrack

This document describes the testing taxonomy, where to add new tests, and how to run them.

---

## Test taxonomy

Tests are organized by intent, not by file type. A single function may have unit-style assertions inside an integration test file; what matters is the scope of the test.

### `tests/branch/`

**Purpose:** Tests tied to a specific branch, feature, or fix. These are the bulk of the automated suite and act as acceptance tests for merged work.

**When to add:** Every feature branch should add or update a test file here.

**Naming:** `tests/branch/<phase-or-topic>/<descriptive-name>.test.ts`

**Example commands:**

```bash
pnpm test tests/branch/p2-9-security-headers/security-headers.test.ts
pnpm test tests/branch/p5-6-frontend-client-security/frontend-security.test.ts
```

### `tests/security/`

**Purpose:** Cross-cutting security assertions that must always pass: headers, secrets leakage, RBAC, API auth.

**When to add:** When a security invariant is introduced or a new attack vector is identified.

**Example commands:**

```bash
pnpm test tests/security/headers.spec.ts
pnpm test tests/security/rbac.spec.ts
pnpm test tests/security/api-auth.spec.ts
pnpm test tests/security/secrets.spec.ts
```

### `tests/certification/`

**Purpose:** Tests that verify production-readiness criteria (PRC/DC gates).

**When to add:** When a certification gate needs an automated check.

**Example command:**

```bash
pnpm test tests/certification
```

### `tests/functional/`

**Purpose:** Functional tests that exercise user flows without requiring a deployed environment.

**When to add:** For workflows that span multiple components but do not need a browser.

**Example command:**

```bash
pnpm test tests/functional
```

### `tests/e2e/`

**Purpose:** End-to-end tests, including Playwright smoke tests.

**When to add:** For critical user journeys that must work in a real browser.

**Example commands:**

```bash
pnpm test:e2e:smoke:local
```

### `tests/chaos/`

**Purpose:** Failure-mode and resilience tests.

**When to add:** When introducing retries, circuit breakers, or degradation behavior.

**Example command:**

```bash
pnpm test tests/chaos
```

### `tests/c0_8/`

**Purpose:** C0.8 coverage and regression tests.

**When to add:** When a coverage or regression gate is defined.

**Example command:**

```bash
pnpm test tests/c0_8
```

### Module-specific tests

Canonical backend modules keep their tests inside the module:

```text
src/backend/modules/search/tests/
├── contract/
├── integration/
├── observability/
├── performance/
└── resilience/
```

These are included in the default `pnpm test` run.

---

## Running tests

### Default branch/certification/security suite

```bash
pnpm test
```

This runs `vitest run tests/c0_8 tests/certification tests/branch` by default.

### Single file

```bash
pnpm test tests/security/headers.spec.ts
```

### Security tests

```bash
pnpm test tests/security
```

### With coverage

```bash
pnpm test -- --coverage
```

### E2E smoke tests

Local:

```bash
pnpm test:e2e:smoke:local
```

Staging (CI):

```bash
pnpm ci:smoke:staging
```

---

## Other verification commands

| Command                             | Purpose                                                          |
| ----------------------------------- | ---------------------------------------------------------------- |
| `pnpm lint`                         | ESLint on `apps/web/src` and `platform/scripts`.                 |
| `pnpm typecheck`                    | TypeScript without emit.                                         |
| `pnpm build`                        | Production build.                                                |
| `pnpm security:bundle-audit`        | Check client bundle for secrets or large imports.                |
| `pnpm delivery:manifest:validate`   | Validate `platform/operations/delivery/manifests/delivery.manifest.json`. |
| `pnpm env:validate`                 | Validate runtime environment variables.                          |
| `pnpm deploy:verify <url>`          | Poll health endpoint until checks pass.                          |
| `pnpm deploy:assert-contract <url>` | Validate health contract version.                                |

---

## Test data and fixtures

- Use `tests/fixtures/` or module-local fixtures for reusable test data.
- Prefer factories over large static fixtures when possible.
- Never commit real secrets or PII in tests.

---

## Mocks

- `__mocks__/next/` — Next.js mocks shared across tests.
- Module-level `vi.mock()` calls for third-party dependencies (e.g., `@base-ui/react/dialog`).
- MSW (Mock Service Worker) for network-layer mocking when needed.

---

## Writing a new test

1. Choose the directory that matches the test's intent (`tests/branch/`, `tests/security/`, etc.).
2. Create a descriptive file name ending in `.test.ts` or `.spec.ts`.
3. Import from `@/` aliases rather than relative paths where possible.
4. Run the single file before running the full suite:

   ```bash
   pnpm test path/to/your.test.ts
   ```

5. Add the file to the relevant certification checklist if it protects a PRC/DC gate.

---

## Related documents

- `CONTRIBUTING.md` — contributor workflow and verification expectations.
- `docs/PRC.md` — Production Readiness Certification checklist.
- `PROJECT_MAP.md` — repository navigation.
