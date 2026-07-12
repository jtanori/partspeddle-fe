# Testing — PartsPeddle / VinTrack

This document describes the testing taxonomy, where to add new tests, and how to run them.

---

## Test taxonomy

Tests are organized by intent, not by file type. A single function may have unit-style assertions inside an integration test file; what matters is the scope of the test.

### `tests/unit/`

**Purpose:** Fast, isolated tests for pure functions, domain logic, view-model builders, and store slices.

**When to add:** For pure behavior with no I/O, network, or browser.

**Naming:** `tests/unit/<domain>/<descriptive-name>.test.ts`

**Example commands:**

```bash
pnpm test tests/unit/get-user-role.test.ts
pnpm test tests/unit/search/build-search-document.spec.ts
```

### `tests/integration/`

**Purpose:** Tests for API routes, repositories, backend modules, middleware, database migrations, and UI component wiring.

**When to add:** For behavior that crosses one or more real subsystems (often with mocked external services).

**Naming:** `tests/integration/<domain>/<descriptive-name>.test.ts`

**Example commands:**

```bash
pnpm test tests/integration/middleware-and-types/proxy.test.ts
pnpm test tests/integration/search/fitment-in-algolia
```

### `tests/e2e/`

**Purpose:** Playwright browser smoke tests for critical user journeys.

**When to add:** For flows that must work in a real browser against a running application.

**Example commands:**

```bash
pnpm test:e2e:smoke:local
pnpm test:e2e:smoke:staging
```

### `tests/certification/`

**Purpose:** Compliance and certification gates for platform guarantees.

**When to add:** When a certification gate needs an automated check.

**Example command:**

```bash
pnpm test tests/certification
```

### `tests/governance/`

**Purpose:** Security, architecture, policy, and environment-validation tests.

**When to add:** When a security invariant, architecture rule, or policy check is introduced.

**Naming:** `tests/governance/<domain>/<descriptive-name>.test.ts`

**Example commands:**

```bash
pnpm test tests/governance/security/headers.spec.ts
pnpm test tests/governance/security/rbac.spec.ts
pnpm test tests/governance/security/api-auth.spec.ts
pnpm test tests/governance/security/secrets.spec.ts
```

### `tests/performance/`

**Purpose:** Resilience, chaos, and load-oriented tests.

**When to add:** When introducing retries, circuit breakers, degradation behavior, or benchmarks.

**Example command:**

```bash
pnpm test tests/performance
```

### `tests/regression/`

**Purpose:** Backward-compatibility suites that guard against accidental breakage.

**When to add:** For coverage gates, semantic parity checks, and layout/link audits.

**Example command:**

```bash
pnpm test tests/regression
```

### `tests/fixtures/` and `tests/helpers/`

**Purpose:** Shared test data and utilities. These directories contain no tests.

**When to add:** When the same data or helper is needed by multiple suites.

### Module-specific tests

Canonical backend modules keep their tests inside the module:

```text
backend/modules/search/tests/
├── contract/
├── integration/
├── observability/
├── performance/
└── resilience/
```

These are included in the default `pnpm test` run.

---

## Running tests

### Default suite

```bash
pnpm test
```

This runs:

```bash
vitest run tests/unit tests/integration tests/regression tests/governance tests/certification tests/performance
```

### Single file

```bash
pnpm test tests/governance/security/headers.spec.ts
```

### Security tests

```bash
pnpm test tests/governance/security
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

| Command                             | Purpose                                                                   |
| ----------------------------------- | ------------------------------------------------------------------------- |
| `pnpm lint`                         | ESLint on `apps/web/src` and `platform/scripts`.                          |
| `pnpm typecheck`                    | TypeScript without emit.                                                  |
| `pnpm build`                        | Production build.                                                         |
| `pnpm security:bundle-audit`        | Check client bundle for secrets or large imports.                         |
| `pnpm delivery:manifest:validate`   | Validate `platform/operations/delivery/manifests/delivery.manifest.json`. |
| `pnpm env:validate`                 | Validate runtime environment variables.                                   |
| `pnpm deploy:verify <url>`          | Poll health endpoint until checks pass.                                   |
| `pnpm deploy:assert-contract <url>` | Validate health contract version.                                         |

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

1. Choose the directory that matches the test's intent (`tests/unit/`, `tests/integration/`, `tests/governance/`, etc.).
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
- `docs/guides/prc.md` — Production Readiness Certification checklist.
- `PROJECT_MAP.md` — repository navigation.
