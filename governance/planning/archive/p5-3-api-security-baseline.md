# P5.3 — API Security Baseline

**Branch:** `feat/p5-3-api-security-baseline`  
**Base:** `develop`  
**Goal:** Establish consistent input validation, safe error responses, payload limits, rate limiting, and idempotency for all Route Handlers.

---

## Current State

- No shared validation library is installed; `package.json` has no `zod`, `joi`, `yup`, etc.
- API routes parse `req.json()` directly and rely on ad-hoc checks.
- `src/app/api/search/parts/route.ts` catches errors and returns HTTP 200 with empty results, masking failures.
- `src/app/api/gemini/identify/route.ts` is **unauthenticated** and accepts arbitrary Base64 images without payload limits.
- `src/app/api/seller/upload-logo/route.ts` is a placeholder returning 501.
- No rate limiting exists for anonymous search, analytics writes, or seller mutations.
- `next.config.ts` does not configure request body size limits.
- No idempotency mechanism exists for multi-step seller writes (`commit_inventory_package`, `publish_listing_draft`).

---

## Gaps

1. No schema validation on request bodies or query strings.
2. Infrastructure failures are masked as successful empty responses (search).
3. Sensitive/administrative endpoints lack authentication.
4. No payload size limits for image uploads or Gemini requests.
5. No rate limiting for anonymous or authenticated callers.
6. No idempotency keys for inventory commit or draft publish.
7. Error response shape is inconsistent across routes.

---

## Work Items

### 1. Add a validation library and shared helpers

- Install `zod` (`pnpm add zod`) — it is small, tree-shakeable, and TypeScript-friendly.
- Create `src/lib/api/validation.ts` with:
  - `validateBody(schema, req)` → typed parsed body or standardized 400.
  - `validateQuery(schema, req)` → typed parsed query params or standardized 400.
  - `validateParams(schema, params)` → typed dynamic route params.
  - Standard error envelope: `{ error: string, details?: Array<{ path, message }> }`.

### 2. Define and apply schemas per route

| Route                                     | Schema focus                                                                                 |
| ----------------------------------------- | -------------------------------------------------------------------------------------------- |
| `POST /api/search/parts`                  | `query` max 1000 chars, `page`/`hitsPerPage` numbers, fitment IDs, price range, sortBy enum. |
| `POST /api/search/events`                 | `query`, `filters`, session/user IDs.                                                        |
| `POST /api/search/clicks`                 | `objectID`, `query`, position.                                                               |
| `GET /api/search/suggestions`             | `q` string, max length.                                                                      |
| `GET /api/parts/featured`                 | `limit` number (optional).                                                                   |
| `GET /api/sellers/top`                    | `limit` number (optional).                                                                   |
| `GET /api/taxonomy`                       | `type` enum, parent IDs.                                                                     |
| `POST /api/gemini/identify`               | `images` array of data URLs, `mode` enum (`part` \| `vehicle`), max total image size.        |
| `POST /api/seller/profile`                | `yardName`, `whatsappNumber`, `location`, `email`.                                           |
| `PATCH /api/seller/drafts/[id]`           | `payloadPatch`, optional `marketValueEstimate`, `suggestedPrice`.                            |
| `POST /api/seller/inventory/commit`       | `listing` object, `assets`, `fitment`.                                                       |
| `POST /api/seller/assets/upload`          | multipart `file`, max file size, allowed MIME types.                                         |
| `POST /api/admin/search/reindex`          | (no body) but enforce `Content-Type` and method.                                             |
| `POST /api/admin/search/reindex/[partId]` | `partId` UUID.                                                                               |

### 3. Stop masking failures as 200

- Refactor `POST /api/search/parts` to return 500 on unexpected errors with a safe message; do not return empty `hits`/`facets` on failure.
- Apply the same rule to `/api/search/events`, `/api/search/clicks`, and `/api/search/suggestions`.
- Log internal error details server-side only.

### 4. Enforce method allowlists

- Each route handler should export only the methods it supports.
- For routes that need explicit method checks, return `405 Method Not Allowed` with an `Allow` header.

### 5. Configure payload limits

In `next.config.ts`:

```ts
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};
```

- Override per route where needed:
  - `/api/gemini/identify`: 10 MB image payload.
  - `/api/seller/assets/upload`: 20 MB file upload.
  - `/api/seller/inventory/commit`: 2 MB JSON payload.
- Add runtime size guards that return 413 before parsing.

### 6. Add rate limiting

Choose and document one approach:

**Option A (recommended for Fly/Upstash):** use `@upstash/ratelimit` + `@upstash/redis` with environment variables `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`.

**Option B (MVP in-memory):** simple per-IP token bucket in process memory; acceptable only for single-instance deployments and documented as non-distributed.

Implement:

- Anonymous search/analytics: 30 requests per minute per IP.
- Authenticated seller mutations: 60 requests per minute per user.
- Admin reindex: 5 requests per minute per admin.
- Gemini identify: 10 requests per minute per user.

Return 429 with `Retry-After` header.

### 7. Add idempotency keys for critical writes

- Accept `Idempotency-Key` header on:
  - `POST /api/seller/inventory/commit`
  - `POST /api/seller/drafts/[id]/publish`
- Store key → response in Redis/Upstash (or ephemeral in-memory for MVP) with a 24-hour TTL.
- Return cached response for duplicate keys; otherwise execute and cache the success response.

### 8. Secure `/api/gemini/identify`

- Require an authenticated session; restrict to `seller` or `admin` role (the endpoint is used for AI-assisted listing creation).
- Apply image validation schema and total payload limit.

### 9. Replace the upload-logo placeholder

- Implement `POST /api/seller/upload-logo` using the same storage pattern as `/api/seller/assets/upload`.
- Validate file type/size; use authenticated seller session.

### 10. Add branch tests

Under `tests/branch/p5-3-api-security-baseline/`:

- Validation errors return 400 with structured details.
- Invalid HTTP method returns 405.
- Payload too large returns 413.
- Rate limit returns 429.
- Search failure returns 500, not 200 with empty results.
- Unauthenticated Gemini request returns 401.
- Idempotency key returns identical response on retry.

### 11. Add API security runbook

Create `docs/API_SECURITY.md` documenting:

- Validation conventions and error envelope.
- Rate-limit tiers and how to tune them.
- Idempotency key usage for sellers.
- How to add a new API route safely.

---

## Acceptance Criteria

- [ ] `zod` is installed and `src/lib/api/validation.ts` exists.
- [ ] Every Route Handler validates its input and returns a standardized 400 on failure.
- [ ] `/api/search/parts` no longer returns HTTP 200 on internal errors.
- [ ] `/api/gemini/identify` requires an authenticated seller/admin session.
- [ ] Payload size limits are configured in `next.config.ts` and enforced at runtime.
- [ ] Rate limiting is active for anonymous search, seller mutations, admin reindex, and Gemini.
- [ ] Idempotency keys work for inventory commit and draft publish.
- [ ] Branch tests cover validation, method, payload, rate-limit, error-mask, and auth scenarios.
- [ ] `pnpm test`, `pnpm lint`, and `pnpm typecheck` pass.

---

## Dependencies

- **Blocked by:** P5.1 (handler locations stable), P5.2 (authenticated sessions aligned).
- **Unblocks:** P5.4 (data-access containment), P5.8 (security certification), P6.4 (service-role removal from public routes).

---

## Risks

- Adding validation may surface existing frontend calls that send unexpected shapes; coordinate smoke tests.
- Rate limiting requires an external Redis/Upstash dependency; document fallback behavior if not configured.
- Switching search error responses from 200 to 500 may change client error handling; update client-side search callers to handle 500 gracefully.
