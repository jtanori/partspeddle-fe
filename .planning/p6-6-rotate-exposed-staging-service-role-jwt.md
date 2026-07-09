# P6.6 — Rotate Exposed Staging Service-Role JWT

**Status:** ✅ Completed in code; physical rotation pending P6.7 remote migration.

---

## What was done

The 2026-07-07 schema dump confirmed that staging contained legacy database triggers that called Edge Functions using a hard-coded service-role JWT:

- `sync-algolia-webhook` on `public.parts`
- `notify-new-message` on `public.messages`

The remediation was added to `supabase/migrations/20260704000000_rebaseline_public_schema.sql`:

```sql
DROP TRIGGER IF EXISTS "sync-algolia-webhook" ON "public"."parts";
DROP TRIGGER IF EXISTS "notify-new-message" ON "public"."messages";
```

In addition:

- Edge Functions were hardened in P1.4 so the legacy bearer-token path is no longer trusted.
- The replacement Algolia sync path uses `search_outbox` + `scripts/search/process-search-outbox.ts`.

## What remains

The actual rotation of the Supabase service-role JWT on the live staging and production projects is tracked as part of **P6.7 — Apply remediation migrations to remote-first databases**. The migration must be applied first; then the JWT secret can be rotated safely.

## Verification checklist

During P6.7 execution, confirm:

- [ ] Legacy triggers no longer exist after migration:
  ```sql
  SELECT trigger_name, event_object_table
  FROM information_schema.triggers
  WHERE trigger_name IN ('sync-algolia-webhook', 'notify-new-message');
  ```
  Expected: zero rows.
- [ ] Supabase service-role JWT is rotated in project settings.
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is updated in Fly.io staging/production secrets.
- [ ] `SUPABASE_SERVICE_ROLE_KEY` GitHub Actions secret is updated.
- [ ] Application smoke tests pass after rotation.

---

## Dependencies

- **Completed by:** P1.4 (Edge Function hardening) + the rebaseline migration.
- **Physical rotation tracked in:** P6.7.
