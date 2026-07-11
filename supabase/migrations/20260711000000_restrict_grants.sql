-- P6.2 — Restrict grants and default privileges to least-privilege roles.

-- 1. Revoke excessive table privileges from anon/authenticated.
DO $$
DECLARE
  tbl text;
BEGIN
  FOR tbl IN
    SELECT tablename FROM pg_tables WHERE schemaname = 'public'
  LOOP
    EXECUTE format('REVOKE ALL ON TABLE %I.%I FROM "anon", "authenticated"', 'public', tbl);
  END LOOP;
END $$;

-- 2. Revoke excessive function privileges from anon/authenticated.
-- Internal trigger/utility functions should only be executable by postgres/service_role.
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA "public" FROM "anon", "authenticated";

-- 3. Reset default privileges so future objects do not inherit ALL for anon/authenticated.
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public"
  REVOKE ALL ON TABLES FROM "anon", "authenticated";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public"
  REVOKE ALL ON FUNCTIONS FROM "anon", "authenticated";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public"
  REVOKE ALL ON SEQUENCES FROM "anon", "authenticated";

-- Grant back minimal default read access for public lookup tables.
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public"
  GRANT SELECT ON TABLES TO "anon", "authenticated";

-- 4. Re-grant explicit least-privilege table access.
-- Public lookup tables: anon + authenticated can read.
GRANT SELECT ON "public"."categories" TO "anon", "authenticated";
GRANT SELECT ON "public"."part_types" TO "anon", "authenticated";
GRANT SELECT ON "public"."makes" TO "anon", "authenticated";
GRANT SELECT ON "public"."models" TO "anon", "authenticated";
GRANT SELECT ON "public"."vehicle_variants" TO "anon", "authenticated";
GRANT SELECT ON "public"."part_fitment" TO "anon", "authenticated";
GRANT SELECT ON "public"."catalog_categories" TO "anon", "authenticated";
GRANT SELECT ON "public"."catalog_category_specs" TO "anon", "authenticated";
GRANT SELECT ON "public"."catalog_spec_definitions" TO "anon", "authenticated";
GRANT SELECT ON "public"."catalog_spec_options" TO "anon", "authenticated";

-- Public marketplace reads (RLS enforces row-level visibility).
GRANT SELECT ON "public"."parts" TO "anon", "authenticated";
GRANT SELECT ON "public"."part_images" TO "anon", "authenticated";
GRANT SELECT ON "public"."seller_profiles" TO "anon", "authenticated";
GRANT SELECT ON "public"."seller_reviews" TO "anon", "authenticated";
GRANT SELECT ON "public"."seller_search_signals" TO "anon", "authenticated";
GRANT SELECT ON "public"."listings" TO "anon", "authenticated";
GRANT SELECT ON "public"."listing_specifications" TO "anon", "authenticated";
GRANT SELECT ON "public"."part_specifications" TO "anon", "authenticated";
GRANT SELECT ON "public"."trust_profiles" TO "anon", "authenticated";

-- Authenticated user-owned writes.
GRANT SELECT, INSERT, UPDATE, DELETE ON "public"."parts" TO "authenticated";
GRANT SELECT, INSERT, UPDATE, DELETE ON "public"."listings" TO "authenticated";
GRANT SELECT, INSERT, UPDATE ON "public"."seller_profiles" TO "authenticated";
GRANT SELECT, INSERT, UPDATE ON "public"."offers" TO "authenticated";
GRANT SELECT, INSERT, UPDATE ON "public"."conversations" TO "authenticated";
GRANT SELECT, INSERT, UPDATE ON "public"."messages" TO "authenticated";
GRANT SELECT, INSERT, UPDATE ON "public"."notifications" TO "authenticated";
GRANT SELECT, INSERT, UPDATE ON "public"."users" TO "authenticated";
GRANT SELECT, INSERT, UPDATE ON "public"."ai_scans" TO "authenticated";
GRANT SELECT, INSERT, UPDATE ON "public"."shipments" TO "authenticated";
GRANT SELECT, INSERT, UPDATE ON "public"."transactions" TO "authenticated";
GRANT SELECT, INSERT, UPDATE ON "public"."transaction_history" TO "authenticated";
GRANT SELECT, INSERT, UPDATE ON "public"."disputes" TO "authenticated";
GRANT SELECT, INSERT, UPDATE ON "public"."events" TO "authenticated";

-- Anonymous analytics writes (validated server-side; see P6.4).
GRANT INSERT ON "public"."search_events" TO "anon", "authenticated";
GRANT INSERT ON "public"."search_click_events" TO "anon", "authenticated";

-- Service role retains broad access for background jobs and admin paths.
-- (Supabase service_role already bypasses RLS; explicit grants keep standard SQL sane.)
GRANT ALL ON ALL TABLES IN SCHEMA "public" TO "service_role";
GRANT ALL ON ALL SEQUENCES IN SCHEMA "public" TO "service_role";
GRANT ALL ON ALL FUNCTIONS IN SCHEMA "public" TO "service_role";
