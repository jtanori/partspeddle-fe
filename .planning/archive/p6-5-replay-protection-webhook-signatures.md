# P6.5 — Add Replay Protection to Webhook Signatures

**Branch:** `feat/p6-5-webhook-replay-protection`  
**Base:** `develop`  
**Goal:** Prevent replay attacks against the `sync-algolia-webhook` Edge Function by including a timestamp in the signed payload and rejecting stale requests.

---

## Current State

`supabase/functions/sync-algolia-webhook/index.ts` verifies the HMAC `x-webhook-secret` signature but does not validate a timestamp or nonce. A captured valid webhook request can be replayed indefinitely as long as the secret has not rotated.

---

## Required Changes

### 1. Signer side

If the caller of the webhook is the database trigger (legacy) or a server-side scheduler, include a timestamp in the signed payload. Because the legacy triggers are being removed in P6.6/P6.7, the primary caller will become the application or a scheduled worker.

Example signed payload:

```json
{
  "type": "INSERT",
  "table": "parts",
  "record": { ... },
  "old_record": null,
  "timestamp": "2026-07-09T19:00:00.000Z"
}
```

The signature is computed over the canonical JSON of this payload.

### 2. Webhook receiver side

Update `supabase/functions/sync-algolia-webhook/index.ts`:

1. Parse the JSON body.
2. Extract `timestamp` from the payload.
3. Reject if `timestamp` is missing or if the request is older than a tolerance window (recommended: 60 seconds).
4. Compute the expected signature over the canonical payload (including timestamp) and compare.
5. Optionally maintain a short-lived nonce cache (e.g., Redis/Upstash or Supabase cache) to reject exact duplicate payloads within the window.

```ts
const MAX_AGE_MS = 60_000;

function isStale(timestamp: string): boolean {
  const eventTime = new Date(timestamp).getTime();
  const now = Date.now();
  return Number.isNaN(eventTime) || now - eventTime > MAX_AGE_MS || eventTime > now + 5000;
}
```

### 3. Update webhook callers

- If the application invokes the webhook directly, update the signing helper to include `timestamp`.
- If a scheduled worker/script invokes it, update that script as well.
- Document the expected payload shape and signature algorithm in `docs/DEPLOYMENT_RUNBOOK.md`.

---

## Work Items

1. Update `supabase/functions/sync-algolia-webhook/index.ts`:
   - Add timestamp extraction and stale-request rejection.
   - Keep the existing HMAC verification.
   - Return 401 for stale requests with a clear message.
2. Update any server-side caller that signs webhook payloads (search for `x-webhook-secret` usage).
3. Add unit tests for the Edge Function under `supabase/functions/sync-algolia-webhook/tests/` or branch tests under `tests/branch/p6-5-webhook-replay-protection/`:
   - Valid fresh request passes.
   - Missing timestamp is rejected.
   - Stale request is rejected.
   - Future timestamp is rejected.
   - Replay of an identical valid request within the window is rejected (if nonce cache is implemented).
4. Update `docs/DEPLOYMENT_RUNBOOK.md` with the webhook signature format and tolerance.
5. Update `docs/PRC.md` Section 11 evidence.

---

## Acceptance Criteria

- [ ] `sync-algolia-webhook` rejects payloads without a timestamp.
- [ ] `sync-algolia-webhook` rejects payloads older than the configured tolerance window.
- [ ] Valid fresh payloads still pass signature verification.
- [ ] Tests cover stale, missing, future, and replay scenarios.
- [ ] Documentation describes the signature payload format.

---

## Dependencies

- **Blocked by:** P1.4 (Edge Function hardening baseline).
- **Unblocks:** P5.8 (security certification), P6.7 (remote migration).

---

## Risks

- Clock skew between caller and Edge Function can cause legitimate requests to be rejected. Allow a small future skew (e.g., 5 seconds) and a reasonable past window.
- Nonce caching adds an external dependency (Redis/Upstash). For MVP, timestamp-only validation may be sufficient; add nonce cache only if the threat model requires it.
