# API Security Runbook

This document describes the conventions and guardrails for PartsPeddle Route Handlers.

---

## Validation

Every Route Handler that accepts input uses `zod` schemas through the helpers in `src/lib/api/validation.ts`:

- `validateBody(schema, req)` — parse JSON bodies.
- `validateQuery(schema, searchParams)` — parse query strings.
- `validateParams(schema, params)` — parse dynamic route params.

Validation failures return `400 Bad Request` with a structured envelope:

```json
{
  "error": "Validation failed.",
  "details": [{ "path": "name", "message": "Required" }]
}
```

## Error Safety

Use `safeErrorResponse(message, status, details?)` from `src/lib/api/errors.ts` for all client-facing errors. Internal details (stack traces, database messages, secret names) must be logged server-side only.

## Rate Limiting

Rate limiting is applied with `rateLimit(req, options)` from `src/lib/api/rate-limit.ts`. The current implementation is an in-memory token bucket suitable for MVP/single-instance deployments; replace with Redis/Upstash for distributed scale.

| Endpoint category            | Limit | Window |
| ---------------------------- | ----- | ------ |
| Anonymous search/analytics   | 30    | 60s    |
| Authenticated seller actions | 60    | 60s    |
| Admin reindex                | 5     | 60s    |
| Gemini identify              | 10    | 60s    |

Exceeded limits return `429 Too Many Requests` with a `Retry-After` header.

## Payload Size Limits

Global limit in `next.config.ts`: `2 MB`. Runtime guards enforce per-route limits:

| Route                          | Limit |
| ------------------------------ | ----- |
| `/api/search/parts`            | 1 MB  |
| `/api/gemini/identify`         | 10 MB |
| `/api/seller/inventory/commit` | 2 MB  |
| `/api/seller/assets/upload`    | 20 MB |
| `/api/seller/upload-logo`      | 5 MB  |

Oversized payloads return `413 Payload Too Large`.

## Idempotency

Critical write endpoints accept an `Idempotency-Key` header and cache successful responses for 24 hours:

- `POST /api/seller/inventory/commit`
- `POST /api/seller/drafts/[id]/publish`

Repeat requests with the same key return the cached response without re-executing the operation.

## Authentication

Browser-initiated APIs use cookie sessions via `@supabase/ssr`. M2M integrations use explicit Bearer tokens. See `docs/ROUTE_AUTH_MATRIX.md` for the full route × role × auth matrix.

## Adding a New Route

1. Decide visibility and required role.
2. Add a Zod schema for body/query/params.
3. Call `checkPayloadSize` before parsing if the route accepts a body.
4. Apply `rateLimit` for public or expensive endpoints.
5. Use `safeErrorResponse` for all error responses.
6. Add a branch test under `tests/branch/`.
