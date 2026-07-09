-- P6.1 — Tighten overly permissive RLS policies identified in the P4.6 DB audit.
-- These changes are safe to apply after the rebaseline migration (20260704000000)
-- and the P5.7 RLS alignment migration (20260709210000).

-- 1. Tighten part_images public read so it only exposes images linked to AVAILABLE parts.
DROP POLICY IF EXISTS "Public read access" ON "public"."part_images";
CREATE POLICY "Public read access for available parts"
  ON "public"."part_images"
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM "public"."parts" p
      WHERE p.id = part_images.part_id
        AND p.status = 'AVAILABLE'
    )
  );

-- 2. Remove user-facing fraud/risk policies; these tables are internal operational data.
DROP POLICY IF EXISTS "Users can view their own fraud events" ON "public"."fraud_events";
DROP POLICY IF EXISTS "Users can view their own risk scores" ON "public"."risk_scores";

-- 3. Strengthen offers insert policy: buyer must own the offer, and the referenced
-- part must be AVAILABLE and belong to the referenced seller.
DROP POLICY IF EXISTS "Buyers can create offers" ON "public"."offers";
CREATE POLICY "Buyers can create offers for available parts"
  ON "public"."offers"
  FOR INSERT
  WITH CHECK (
    buyer_id = auth.uid()
    AND seller_id = (
      SELECT seller_id FROM "public"."parts" WHERE id = part_id AND status = 'AVAILABLE'
    )
  );

-- 4. Strengthen conversations insert policy: conversation must reference an existing,
-- AVAILABLE part and the seller_id must match the part's seller.
DROP POLICY IF EXISTS "Users can insert conversations" ON "public"."conversations";
CREATE POLICY "Buyers can start conversations about available parts"
  ON "public"."conversations"
  FOR INSERT
  WITH CHECK (
    buyer_id = auth.uid()
    AND part_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM "public"."parts" p
      WHERE p.id = part_id
        AND p.status = 'AVAILABLE'
        AND p.seller_id = seller_id
    )
  );

-- 5. Restrict seller_owns_profile to SELECT/UPDATE only (remove implicit DELETE).
DROP POLICY IF EXISTS "seller_owns_profile" ON "public"."seller_profiles";
CREATE POLICY "seller_owns_profile_select"
  ON "public"."seller_profiles"
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "seller_owns_profile_update"
  ON "public"."seller_profiles"
  FOR UPDATE
  USING (user_id = auth.uid());
