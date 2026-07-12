# Security Manual Checks

Use this checklist during the P5.8 production security certification. Record evidence (screenshots, curl output, HAR files) and link them from `docs/guides/prc.md` Section 11.

---

## Broken Access Control

- [ ] Anonymous user accessing `/dashboard` is redirected to `/login`.
- [ ] Anonymous user accessing `/seller` is redirected to `/login`.
- [ ] Anonymous user accessing `/admin` is redirected to `/login`.
- [ ] Buyer role accessing `/seller` is redirected to `/dashboard`.
- [ ] Buyer/seller role accessing `/admin` is redirected to `/dashboard`.
- [ ] Logged-in user accessing `/login` is redirected away.
- [ ] `GET /api/seller/inventory` without session returns `401`.
- [ ] `POST /api/admin/search/reindex` with buyer/seller session returns `403`.

## IDOR / Tenant Isolation

- [ ] Seller A cannot fetch Seller B’s inventory via `/api/seller/inventory`.
- [ ] Anon user cannot read `/listing/[id]` for a non-`AVAILABLE` part.
- [ ] Authenticated user cannot read another user’s conversations/messages.

## Secrets & Sensitive Data

- [ ] No `SUPABASE_SERVICE_ROLE_KEY`, `ALGOLIA_ADMIN_KEY`, or `GEMINI_API_KEY` in `.next/static/**` after build (`pnpm security:bundle-audit`).
- [ ] API error responses do not contain stack traces or secret names.
- [ ] Server logs redact tokens, API keys, and PII.

## Headers

- [ ] `Content-Security-Policy` is present on all routes and does not contain `'unsafe-inline'` for scripts in production.
- [ ] `Strict-Transport-Security` is `max-age=63072000; includeSubDomains; preload`.
- [ ] `X-Frame-Options` is `DENY`.
- [ ] `X-Content-Type-Options` is `nosniff`.

## Uploads

- [ ] File upload rejects non-image MIME types.
- [ ] File upload rejects files larger than 20 MB (assets) / 5 MB (logo).

## Dependencies

- [ ] `pnpm audit --production` reports zero critical/high vulnerabilities.

## Evidence

| Check             | Result        | Evidence Link |
| ----------------- | ------------- | ------------- |
| RBAC redirect     | ☐ PASS ☐ FAIL |               |
| API auth negative | ☐ PASS ☐ FAIL |               |
| IDOR isolation    | ☐ PASS ☐ FAIL |               |
| Secrets in bundle | ☐ PASS ☐ FAIL |               |
| Headers           | ☐ PASS ☐ FAIL |               |
| Upload validation | ☐ PASS ☐ FAIL |               |
| Dependency audit  | ☐ PASS ☐ FAIL |               |
