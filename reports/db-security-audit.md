# Database Security Audit Report

Generated: 2026-07-07T18:26:44.717Z

## Summary

- Critical: 0
- High: 0
- Medium: 31
- Low: 4
- Total findings: 35

## PRC Section 11 Checklist

| ID        | Check                                                                                             | Result |
| --------- | ------------------------------------------------------------------------------------------------- | ------ |
| SD-1      | All SECURITY DEFINER functions set search_path = public, pg_temp                                  | PASS   |
| TBL-1     | public.user_roles table is defined in schema/migrations                                           | PASS   |
| AUTH-1    | New sign-ups cannot self-escalate roles via raw_user_meta_data                                    | PASS   |
| WEBHOOK-1 | Legacy synchronous webhook triggers with hard-coded JWTs are removed                              | PASS   |
| EF-1      | Edge Functions enforce authentication before acting                                               | PASS   |
| RLS-1     | Every RLS-enabled table has at least one explicit policy (or documented service-role-only access) | GAP    |
| EXT-1     | Only required Postgres extensions are installed                                                   | GAP    |
| SR-1      | Service-role client is only used where RLS bypass is justified                                    | GAP    |

## Findings

### Extension surface — LOW

Extension "pg_net" is installed. Verify it is required for the marketplace.

**Remediation:** Drop pg_net if it is not actively used.

### Extension surface — LOW

Extension "pg_graphql" is installed. Verify it is required for the marketplace.

**Remediation:** Drop pg_graphql if it is not actively used.

### Extension surface — LOW

Extension "supabase_vault" is installed. Verify it is required for the marketplace.

**Remediation:** Drop supabase_vault if it is not actively used.

### Extension surface — LOW

Extension "uuid-ossp" is installed. Verify it is required for the marketplace.

**Remediation:** Drop uuid-ossp if it is not actively used.

### RLS policy gap — MEDIUM

Table "public"."audit_log" has RLS enabled but no policies defined in the audited files.

**Remediation:** Add explicit SELECT/INSERT/UPDATE/DELETE policies or document the service-role-only access model.

### RLS policy gap — MEDIUM

Table "public"."audit_log_2026_06" has RLS enabled but no policies defined in the audited files.

**Remediation:** Add explicit SELECT/INSERT/UPDATE/DELETE policies or document the service-role-only access model.

### RLS policy gap — MEDIUM

Table "public"."audit_log_2026_07" has RLS enabled but no policies defined in the audited files.

**Remediation:** Add explicit SELECT/INSERT/UPDATE/DELETE policies or document the service-role-only access model.

### RLS policy gap — MEDIUM

Table "public"."catalog_categories" has RLS enabled but no policies defined in the audited files.

**Remediation:** Add explicit SELECT/INSERT/UPDATE/DELETE policies or document the service-role-only access model.

### RLS policy gap — MEDIUM

Table "public"."catalog_category_specs" has RLS enabled but no policies defined in the audited files.

**Remediation:** Add explicit SELECT/INSERT/UPDATE/DELETE policies or document the service-role-only access model.

### RLS policy gap — MEDIUM

Table "public"."catalog_spec_definitions" has RLS enabled but no policies defined in the audited files.

**Remediation:** Add explicit SELECT/INSERT/UPDATE/DELETE policies or document the service-role-only access model.

### RLS policy gap — MEDIUM

Table "public"."catalog_spec_options" has RLS enabled but no policies defined in the audited files.

**Remediation:** Add explicit SELECT/INSERT/UPDATE/DELETE policies or document the service-role-only access model.

### RLS policy gap — MEDIUM

Table "public"."disputes" has RLS enabled but no policies defined in the audited files.

**Remediation:** Add explicit SELECT/INSERT/UPDATE/DELETE policies or document the service-role-only access model.

### RLS policy gap — MEDIUM

Table "public"."listing_specifications" has RLS enabled but no policies defined in the audited files.

**Remediation:** Add explicit SELECT/INSERT/UPDATE/DELETE policies or document the service-role-only access model.

### RLS policy gap — MEDIUM

Table "public"."listings" has RLS enabled but no policies defined in the audited files.

**Remediation:** Add explicit SELECT/INSERT/UPDATE/DELETE policies or document the service-role-only access model.

### RLS policy gap — MEDIUM

Table "public"."part_specifications" has RLS enabled but no policies defined in the audited files.

**Remediation:** Add explicit SELECT/INSERT/UPDATE/DELETE policies or document the service-role-only access model.

### RLS policy gap — MEDIUM

Table "public"."parts" has RLS enabled but no policies defined in the audited files.

**Remediation:** Add explicit SELECT/INSERT/UPDATE/DELETE policies or document the service-role-only access model.

### RLS policy gap — MEDIUM

Table "public"."search_audit_runs" has RLS enabled but no policies defined in the audited files.

**Remediation:** Add explicit SELECT/INSERT/UPDATE/DELETE policies or document the service-role-only access model.

### RLS policy gap — MEDIUM

Table "public"."search_click_events" has RLS enabled but no policies defined in the audited files.

**Remediation:** Add explicit SELECT/INSERT/UPDATE/DELETE policies or document the service-role-only access model.

### RLS policy gap — MEDIUM

Table "public"."search_events" has RLS enabled but no policies defined in the audited files.

**Remediation:** Add explicit SELECT/INSERT/UPDATE/DELETE policies or document the service-role-only access model.

### RLS policy gap — MEDIUM

Table "public"."search_outbox" has RLS enabled but no policies defined in the audited files.

**Remediation:** Add explicit SELECT/INSERT/UPDATE/DELETE policies or document the service-role-only access model.

### RLS policy gap — MEDIUM

Table "public"."search_request_metrics" has RLS enabled but no policies defined in the audited files.

**Remediation:** Add explicit SELECT/INSERT/UPDATE/DELETE policies or document the service-role-only access model.

### RLS policy gap — MEDIUM

Table "public"."search_worker_runs" has RLS enabled but no policies defined in the audited files.

**Remediation:** Add explicit SELECT/INSERT/UPDATE/DELETE policies or document the service-role-only access model.

### RLS policy gap — MEDIUM

Table "public"."seller_reviews" has RLS enabled but no policies defined in the audited files.

**Remediation:** Add explicit SELECT/INSERT/UPDATE/DELETE policies or document the service-role-only access model.

### Service-role usage — MEDIUM

src/app/api/admin/search/reindex/[partId]/route.ts imports supabaseAdmin and bypasses RLS.

**Remediation:** Use the anon/SSR client where possible; reserve service role for background jobs or admin routes.

### Service-role usage — MEDIUM

src/app/api/admin/search/reindex/route.ts imports supabaseAdmin and bypasses RLS.

**Remediation:** Use the anon/SSR client where possible; reserve service role for background jobs or admin routes.

### Service-role usage — MEDIUM

src/app/api/gemini/identify/route.ts imports supabaseAdmin and bypasses RLS.

**Remediation:** Use the anon/SSR client where possible; reserve service role for background jobs or admin routes.

### Service-role usage — MEDIUM

src/app/api/parts/featured/route.ts imports supabaseAdmin and bypasses RLS.

**Remediation:** Use the anon/SSR client where possible; reserve service role for background jobs or admin routes.

### Service-role usage — MEDIUM

src/app/api/search/clicks/route.ts imports supabaseAdmin and bypasses RLS.

**Remediation:** Use the anon/SSR client where possible; reserve service role for background jobs or admin routes.

### Service-role usage — MEDIUM

src/app/api/search/events/route.ts imports supabaseAdmin and bypasses RLS.

**Remediation:** Use the anon/SSR client where possible; reserve service role for background jobs or admin routes.

### Service-role usage — MEDIUM

src/app/api/seller/assets/upload/route.ts imports supabaseAdmin and bypasses RLS.

**Remediation:** Use the anon/SSR client where possible; reserve service role for background jobs or admin routes.

### Service-role usage — MEDIUM

src/app/api/seller/inventory/commit/route.ts imports supabaseAdmin and bypasses RLS.

**Remediation:** Use the anon/SSR client where possible; reserve service role for background jobs or admin routes.

### Service-role usage — MEDIUM

src/app/api/seller/inventory/route.ts imports supabaseAdmin and bypasses RLS.

**Remediation:** Use the anon/SSR client where possible; reserve service role for background jobs or admin routes.

### Service-role usage — MEDIUM

src/app/api/seller/profile/route.ts imports supabaseAdmin and bypasses RLS.

**Remediation:** Use the anon/SSR client where possible; reserve service role for background jobs or admin routes.

### Service-role usage — MEDIUM

src/app/api/sellers/top/route.ts imports supabaseAdmin and bypasses RLS.

**Remediation:** Use the anon/SSR client where possible; reserve service role for background jobs or admin routes.

### Service-role usage — MEDIUM

src/app/api/taxonomy/route.ts imports supabaseAdmin and bypasses RLS.

**Remediation:** Use the anon/SSR client where possible; reserve service role for background jobs or admin routes.
