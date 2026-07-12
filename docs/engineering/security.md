# Security Engineering

This document covers security mechanisms that affect the whole application.

---

## Content Security Policy (CSP)

### Goal

Keep a strict CSP that blocks inline scripts in production while still allowing Next.js App Router to hydrate.

### How it works

- `src/proxy.ts` generates a 16-byte cryptographically-secure nonce on every request using Web Crypto.
- The proxy sets `Content-Security-Policy` via `buildContentSecurityPolicy(nonce)` from `src/lib/security-headers.ts`.
- The policy uses `script-src 'self' 'nonce-<value>'` so Next.js can attach the same nonce to its inline Flight bootstrap scripts.
- Other static security headers (`Strict-Transport-Security`, `X-Frame-Options`, etc.) remain in `next.config.ts` because they do not need a per-request value.

### History

- **Before 2026-07-11:** Production CSP allowed `script-src 'self' 'unsafe-inline'` as a temporary compatibility measure for Next.js App Router hydration.
- **After 2026-07-11:** Production CSP moved to a per-request nonce set by middleware. The fallback without a nonce still allows `'unsafe-inline'` for static-generation and development contexts.

### Verification

```bash
pnpm test tests/security/headers.spec.ts
pnpm test tests/branch/p5-6-frontend-client-security/frontend-security.test.ts
```

In production or staging, confirm the response header:

```text
Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-<base64>'; ...
```

And confirm the page hydrates with no CSP violations in the browser console.

### Files

- `src/proxy.ts` — nonce generation and request-scoped CSP header.
- `src/lib/security-headers.ts` — policy builder and static header definitions.
- `next.config.ts` — static security headers.
- `tests/security/headers.spec.ts` — automated assertions.

## Related documents

- `docs/operations/secret-governance.md` — where each class of secret is stored.
- `docs/PRC.md` Section 11 — security certification checklist.
