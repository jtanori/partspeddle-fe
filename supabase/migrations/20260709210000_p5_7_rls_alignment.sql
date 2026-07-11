-- =============================================================================
-- P5.7 — Database Security Alignment
-- =============================================================================
-- Adds RLS policies required for the application to stop using the service-role
-- client for public reads and seller-scoped writes. Service-role clients bypass
-- RLS, so admin/reindex/background jobs remain unaffected.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- parts
-- -----------------------------------------------------------------------------
ALTER TABLE "public"."parts" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "parts_public_select" ON "public"."parts";
CREATE POLICY "parts_public_select" ON "public"."parts"
    FOR SELECT USING ("status" = 'AVAILABLE');

DROP POLICY IF EXISTS "parts_seller_select" ON "public"."parts";
CREATE POLICY "parts_seller_select" ON "public"."parts"
    FOR SELECT USING ("auth"."uid"() = "seller_id");

DROP POLICY IF EXISTS "parts_seller_insert" ON "public"."parts";
CREATE POLICY "parts_seller_insert" ON "public"."parts"
    FOR INSERT WITH CHECK ("auth"."uid"() = "seller_id");

DROP POLICY IF EXISTS "parts_seller_update" ON "public"."parts";
CREATE POLICY "parts_seller_update" ON "public"."parts"
    FOR UPDATE USING ("auth"."uid"() = "seller_id") WITH CHECK ("auth"."uid"() = "seller_id");

DROP POLICY IF EXISTS "parts_seller_delete" ON "public"."parts";
CREATE POLICY "parts_seller_delete" ON "public"."parts"
    FOR DELETE USING ("auth"."uid"() = "seller_id");

-- -----------------------------------------------------------------------------
-- seller_profiles
-- -----------------------------------------------------------------------------
ALTER TABLE "public"."seller_profiles" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "seller_profiles_public_select" ON "public"."seller_profiles";
CREATE POLICY "seller_profiles_public_select" ON "public"."seller_profiles"
    FOR SELECT USING ("verification_status" = 'verified');

DROP POLICY IF EXISTS "seller_profiles_owner_select" ON "public"."seller_profiles";
CREATE POLICY "seller_profiles_owner_select" ON "public"."seller_profiles"
    FOR SELECT USING ("auth"."uid"() = "user_id");

DROP POLICY IF EXISTS "seller_profiles_owner_update" ON "public"."seller_profiles";
CREATE POLICY "seller_profiles_owner_update" ON "public"."seller_profiles"
    FOR UPDATE USING ("auth"."uid"() = "user_id") WITH CHECK ("auth"."uid"() = "user_id");

-- Replace broad seller_owns_profile policy with narrower ones if it exists.
DROP POLICY IF EXISTS "seller_owns_profile" ON "public"."seller_profiles";

-- -----------------------------------------------------------------------------
-- part_images
-- -----------------------------------------------------------------------------
ALTER TABLE "public"."part_images" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "part_images_public_select" ON "public"."part_images";
CREATE POLICY "part_images_public_select" ON "public"."part_images"
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM "public"."parts" p
            WHERE p."id" = "part_images"."part_id" AND p."status" = 'AVAILABLE'
        )
    );

-- -----------------------------------------------------------------------------
-- search_click_events / search_events
-- -----------------------------------------------------------------------------
ALTER TABLE "public"."search_click_events" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."search_events" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "search_click_events_anon_insert" ON "public"."search_click_events";
CREATE POLICY "search_click_events_anon_insert" ON "public"."search_click_events"
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "search_events_anon_insert" ON "public"."search_events";
CREATE POLICY "search_events_anon_insert" ON "public"."search_events"
    FOR INSERT WITH CHECK (true);
