-- =============================================================================
-- P5.0 Phase 7 — Listing Draft / AI-assisted Wizard
-- =============================================================================
-- Persistent listing drafts live separately from published inventory so the
-- wizard can store partial, AI-derived, and transient data without polluting
-- the canonical parts table.
-- =============================================================================

CREATE TABLE IF NOT EXISTS "public"."listing_drafts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "seller_id" "uuid" NOT NULL,
    "status" "text" DEFAULT 'draft'::"text" NOT NULL,
    "payload" "jsonb" NOT NULL DEFAULT '{}'::"jsonb",
    "completion_score" integer DEFAULT 0 NOT NULL,
    "market_value_estimate" integer,
    "suggested_price" integer,
    "published_part_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "listing_drafts_status_check" CHECK (("status" = ANY (ARRAY['draft'::"text", 'publishing'::"text", 'published'::"text", 'discarded'::"text"]))),
    CONSTRAINT "listing_drafts_completion_score_check" CHECK ((("completion_score" >= 0) AND ("completion_score" <= 100)))
);

ALTER TABLE "public"."listing_drafts" OWNER TO "postgres";

-- Primary key
ALTER TABLE ONLY "public"."listing_drafts"
    ADD CONSTRAINT "listing_drafts_pkey" PRIMARY KEY ("id");

-- Foreign keys
ALTER TABLE ONLY "public"."listing_drafts"
    ADD CONSTRAINT "listing_drafts_published_part_id_fkey" FOREIGN KEY ("published_part_id") REFERENCES "public"."parts"("id") ON DELETE SET NULL;



-- Indexes
CREATE INDEX IF NOT EXISTS "idx_listing_drafts_seller_status" ON "public"."listing_drafts" USING "btree" ("seller_id", "status");

-- Updated-at trigger
CREATE OR REPLACE FUNCTION public.set_listing_drafts_updated_at()
RETURNS trigger AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS "set_listing_drafts_updated_at" ON "public"."listing_drafts";
CREATE TRIGGER "set_listing_drafts_updated_at"
    BEFORE UPDATE ON "public"."listing_drafts"
    FOR EACH ROW
    EXECUTE FUNCTION "public"."set_listing_drafts_updated_at"();

-- RLS
ALTER TABLE "public"."listing_drafts" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "seller_drafts_select" ON "public"."listing_drafts";
CREATE POLICY "seller_drafts_select" ON "public"."listing_drafts"
    FOR SELECT USING (("auth"."uid"() = "seller_id"));

DROP POLICY IF EXISTS "seller_drafts_insert" ON "public"."listing_drafts";
CREATE POLICY "seller_drafts_insert" ON "public"."listing_drafts"
    FOR INSERT WITH CHECK (("auth"."uid"() = "seller_id"));

DROP POLICY IF EXISTS "seller_drafts_update" ON "public"."listing_drafts";
CREATE POLICY "seller_drafts_update" ON "public"."listing_drafts"
    FOR UPDATE USING (("auth"."uid"() = "seller_id")) WITH CHECK (("auth"."uid"() = "seller_id"));

DROP POLICY IF EXISTS "seller_drafts_delete" ON "public"."listing_drafts";
CREATE POLICY "seller_drafts_delete" ON "public"."listing_drafts"
    FOR DELETE USING (("auth"."uid"() = "seller_id"));

-- =============================================================================
-- Publish RPC: validates a draft, inserts/updates parts, links images and
-- fitment, and returns the published part id.
-- =============================================================================
CREATE OR REPLACE FUNCTION public.publish_listing_draft(draft_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    draft_record listing_drafts%ROWTYPE;
    new_part_id uuid;
    asset jsonb;
    fitment_item jsonb;
    identification jsonb;
    pricing jsonb;
    media jsonb;
    fitment jsonb;
    seo jsonb;
BEGIN
    SELECT * INTO draft_record
    FROM listing_drafts
    WHERE id = draft_id AND seller_id = auth.uid();

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Draft not found or access denied';
    END IF;

    IF draft_record.status NOT IN ('draft', 'publishing') THEN
        RAISE EXCEPTION 'Draft is not publishable';
    END IF;

    UPDATE listing_drafts
    SET status = 'publishing'
    WHERE id = draft_id;

    identification := COALESCE(draft_record.payload -> 'identification', '{}'::jsonb);
    pricing := COALESCE(draft_record.payload -> 'pricing', '{}'::jsonb);
    media := COALESCE(draft_record.payload -> 'media', '{}'::jsonb);
    fitment := COALESCE(draft_record.payload -> 'fitment', '{}'::jsonb);
    seo := COALESCE(draft_record.payload -> 'seo', '{}'::jsonb);

    INSERT INTO parts (
        id,
        seller_id,
        status,
        title,
        description,
        price_mxn,
        condition,
        listing_quality_score,
        ai_data,
        searchable_text
    ) VALUES (
        COALESCE(draft_record.published_part_id, gen_random_uuid()),
        draft_record.seller_id,
        'PENDING_REVIEW'::part_status,
        COALESCE(identification ->> 'title', ''),
        COALESCE(identification ->> 'description', ''),
        COALESCE((pricing ->> 'price_mxn')::integer, 0),
        COALESCE(NULLIF(pricing ->> 'condition', ''), 'USED_GOOD')::part_condition,
        draft_record.completion_score,
        media -> 'aiData',
        COALESCE(seo ->> 'searchableText', identification ->> 'title', '')
    )
    ON CONFLICT (id) DO UPDATE SET
        status = 'PENDING_REVIEW'::part_status,
        title = COALESCE(identification ->> 'title', parts.title),
        description = COALESCE(identification ->> 'description', parts.description),
        price_mxn = COALESCE((pricing ->> 'price_mxn')::integer, parts.price_mxn),
        condition = COALESCE(NULLIF(pricing ->> 'condition', ''), parts.condition)::part_condition,
        listing_quality_score = draft_record.completion_score,
        ai_data = media -> 'aiData',
        searchable_text = COALESCE(seo ->> 'searchableText', identification ->> 'title', parts.searchable_text),
        updated_at = NOW()
    RETURNING id INTO new_part_id;

    DELETE FROM part_images WHERE part_id = new_part_id;

    FOR asset IN SELECT * FROM jsonb_array_elements(COALESCE(media -> 'images', '[]'::jsonb))
    LOOP
        INSERT INTO part_images (part_id, url, is_primary)
        VALUES (
            new_part_id,
            COALESCE(asset ->> 'publicUrl', asset ->> 'url', ''),
            COALESCE((asset ->> 'isPrimary')::boolean, false)
        );
    END LOOP;

    DELETE FROM part_fitment WHERE part_id = new_part_id;

    FOR fitment_item IN SELECT * FROM jsonb_array_elements(COALESCE(fitment -> 'vehicles', '[]'::jsonb))
    LOOP
        INSERT INTO part_fitment (part_id, vehicle_variant_id, notes)
        VALUES (
            new_part_id,
            (fitment_item ->> 'vehicleVariantId')::uuid,
            COALESCE(fitment_item ->> 'notes', '')
        )
        ON CONFLICT (part_id, vehicle_variant_id) DO NOTHING;
    END LOOP;

    UPDATE listing_drafts
    SET
        status = 'published',
        published_part_id = new_part_id,
        updated_at = NOW()
    WHERE id = draft_id;

    RETURN new_part_id;
END;
$$;
