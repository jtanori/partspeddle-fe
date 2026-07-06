SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;
COMMENT ON SCHEMA "public" IS 'standard public schema';
CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "public";
CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
CREATE TYPE "public"."part_condition" AS ENUM (
    'NEW',
    'REMANUFACTURED',
    'USED_EXCELLENT',
    'USED_GOOD',
    'USED_FAIR',
    'FOR_PARTS'
);
CREATE TYPE "public"."part_status" AS ENUM (
    'DRAFT',
    'PENDING_REVIEW',
    'AVAILABLE',
    'RESERVED',
    'SOLD',
    'REMOVED',
    'ARCHIVED'
);
CREATE OR REPLACE FUNCTION "public"."cleanup_old_notifications"() RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    DELETE FROM public.notifications
    WHERE created_at < NOW() - INTERVAL '180 days';
END;
$$;
CREATE OR REPLACE FUNCTION "public"."fn_audit_log_changes"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_actor_id UUID;
BEGIN
    -- Intentar obtener el ID del usuario desde auth.uid()
    BEGIN
        v_actor_id := auth.uid();
    EXCEPTION WHEN OTHERS THEN
        v_actor_id := NULL;
    END;
    -- Registrar el cambio
    INSERT INTO public.audit_log (
        actor_id,
        action,
        entity_type,
        entity_id,
        before_state,
        after_state
    ) VALUES (
        v_actor_id,
        TG_OP,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE to_jsonb(OLD) END,
        CASE WHEN TG_OP = 'DELETE' THEN NULL ELSE to_jsonb(NEW) END
    );
    
    RETURN NULL;
END;
$$;
CREATE OR REPLACE FUNCTION "public"."fn_enqueue_search_event"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO public.search_outbox (aggregate_type, aggregate_id, event_type, payload)
  VALUES ('part', CASE WHEN TG_OP = 'DELETE' THEN OLD.id ELSE NEW.id END, TG_TABLE_NAME || '_' || TG_OP, to_jsonb(CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END));
  RETURN NULL;
END;
$$;
CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
CREATE OR REPLACE FUNCTION "public"."handle_part_sale_lock"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    -- Si la transacción fue exitosa o capturada en bóveda
    IF NEW.status = ANY (ARRAY['succeeded'::text, 'held_in_vault'::text, 'delivered'::text]) THEN
        
        -- 1. Marcar la pieza como vendida de forma atómica
        UPDATE public.parts 
        SET status = 'sold', updated_at = now()
        WHERE id = NEW.part_id;
        -- 2. Declinar automáticamente otras ofertas pendientes por la misma pieza
        UPDATE public.offers
        SET status = 'declined', updated_at = now()
        WHERE part_id = NEW.part_id AND status = 'pending';
        
    END IF;
    RETURN NEW;
END;
$$;
CREATE OR REPLACE FUNCTION "public"."refresh_seller_search_signals"() RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.seller_search_signals;
END;
$$;
CREATE OR REPLACE FUNCTION "public"."validate_transaction_seller"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    part_seller_id UUID;
BEGIN
    -- Fetch the seller_id of the part being purchased
    SELECT seller_id INTO part_seller_id FROM public.parts WHERE id = NEW.part_id;
    -- Validate that the transaction seller_id matches the part's seller_id
    IF NEW.seller_id IS NOT NULL AND NEW.seller_id <> part_seller_id THEN
        RAISE EXCEPTION 'Transaction seller_id does not match the seller of the part.';
    END IF;
    RETURN NEW;
END;
$$;
SET default_tablespace = '';
SET default_table_access_method = "heap";
CREATE TABLE IF NOT EXISTS "public"."ai_scans" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"(),
    "image_url" "text",
    "status" "text",
    "result" "jsonb",
    "error" "text",
    "attempts" integer DEFAULT 0,
    "created_at" timestamp without time zone DEFAULT "now"(),
    "completed_at" timestamp without time zone,
    CONSTRAINT "ai_scans_status_check" CHECK (("status" = ANY (ARRAY['queued'::"text", 'processing'::"text", 'completed'::"text", 'failed'::"text"])))
);
CREATE TABLE IF NOT EXISTS "public"."audit_log" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "actor_id" "uuid",
    "action" "text" NOT NULL,
    "entity_type" "text" NOT NULL,
    "entity_id" "uuid" NOT NULL,
    "before_state" "jsonb",
    "after_state" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
)
PARTITION BY RANGE ("created_at");
CREATE TABLE IF NOT EXISTS "public"."audit_log_2026_06" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "actor_id" "uuid",
    "action" "text" NOT NULL,
    "entity_type" "text" NOT NULL,
    "entity_id" "uuid" NOT NULL,
    "before_state" "jsonb",
    "after_state" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);
CREATE TABLE IF NOT EXISTS "public"."audit_log_2026_07" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "actor_id" "uuid",
    "action" "text" NOT NULL,
    "entity_type" "text" NOT NULL,
    "entity_id" "uuid" NOT NULL,
    "before_state" "jsonb",
    "after_state" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);
CREATE TABLE IF NOT EXISTS "public"."catalog_categories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "parent_id" "uuid",
    "slug" "text" NOT NULL,
    "name" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "search_template" "text",
    "wizard_template" "text",
    "pdp_template" "text"
);
CREATE TABLE IF NOT EXISTS "public"."catalog_category_specs" (
    "category_id" "uuid" NOT NULL,
    "spec_definition_id" "uuid" NOT NULL,
    "required" boolean DEFAULT false,
    "display_order" integer DEFAULT 0,
    "group_name" "text"
);
CREATE TABLE IF NOT EXISTS "public"."catalog_spec_definitions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "key" "text" NOT NULL,
    "label" "text" NOT NULL,
    "data_type" "text" NOT NULL,
    "unit" "text",
    "searchable" boolean DEFAULT false,
    "filterable" boolean DEFAULT false,
    "is_active" boolean DEFAULT true,
    "validation_rules" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "facetable" boolean DEFAULT false,
    CONSTRAINT "catalog_spec_definitions_data_type_check" CHECK (("data_type" = ANY (ARRAY['text'::"text", 'number'::"text", 'boolean'::"text", 'enum'::"text"])))
);
CREATE TABLE IF NOT EXISTS "public"."catalog_spec_options" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "spec_definition_id" "uuid" NOT NULL,
    "value" "text" NOT NULL,
    "label" "text" NOT NULL,
    "display_order" integer DEFAULT 0
);
CREATE TABLE IF NOT EXISTS "public"."categories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" character varying(255) NOT NULL,
    "slug" character varying(255) NOT NULL,
    "icon" character varying(50),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "name_es" "text",
    "name_en" "text",
    "slug_es" "text",
    "slug_en" "text"
);
CREATE TABLE IF NOT EXISTS "public"."conversations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "part_id" "uuid",
    "buyer_id" "uuid" NOT NULL,
    "seller_id" "uuid" NOT NULL,
    "status" "text" DEFAULT 'active'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "deleted_at" timestamp with time zone,
    CONSTRAINT "conversations_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'archived'::"text"])))
);
CREATE TABLE IF NOT EXISTS "public"."disputes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "transaction_id" "uuid" NOT NULL,
    "opened_by" "uuid" NOT NULL,
    "status" "text" DEFAULT 'open'::"text" NOT NULL,
    "reason" "text" NOT NULL,
    "resolution" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "disputes_status_check" CHECK (("status" = ANY (ARRAY['open'::"text", 'under_review'::"text", 'resolved'::"text", 'closed'::"text"])))
);
CREATE TABLE IF NOT EXISTS "public"."events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "type" "text" NOT NULL,
    "user_id" "uuid",
    "entity_id" "uuid",
    "payload" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp without time zone DEFAULT "now"()
);
CREATE TABLE IF NOT EXISTS "public"."fraud_events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "transaction_id" "uuid",
    "type" "text",
    "severity" "text",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp without time zone DEFAULT "now"()
);
CREATE TABLE IF NOT EXISTS "public"."listing_specifications" (
    "listing_id" "uuid" NOT NULL,
    "spec_definition_id" "uuid" NOT NULL,
    "value_text" "text",
    "value_number" numeric,
    "value_boolean" boolean,
    CONSTRAINT "one_value_populated" CHECK ((((
CASE
    WHEN ("value_text" IS NOT NULL) THEN 1
    ELSE 0
END +
CASE
    WHEN ("value_number" IS NOT NULL) THEN 1
    ELSE 0
END) +
CASE
    WHEN ("value_boolean" IS NOT NULL) THEN 1
    ELSE 0
END) = 1))
);
CREATE TABLE IF NOT EXISTS "public"."listings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "seller_id" "uuid" NOT NULL,
    "listing_type" "text" NOT NULL,
    "status" "text" DEFAULT 'draft'::"text",
    "price" numeric NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "listings_listing_type_check" CHECK (("listing_type" = ANY (ARRAY['PART'::"text", 'DONOR_VEHICLE'::"text"]))),
    CONSTRAINT "listings_status_check" CHECK (("status" = ANY (ARRAY['draft'::"text", 'pending_review'::"text", 'available'::"text", 'reserved'::"text", 'sold'::"text", 'removed'::"text", 'archived'::"text"])))
);
CREATE TABLE IF NOT EXISTS "public"."makes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" character varying(100) NOT NULL
);
CREATE TABLE IF NOT EXISTS "public"."messages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "conversation_id" "uuid" NOT NULL,
    "sender_id" "uuid" NOT NULL,
    "content" "text" NOT NULL,
    "read_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "deleted_at" timestamp with time zone
);
CREATE TABLE IF NOT EXISTS "public"."models" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "make_id" "uuid",
    "name" character varying(100) NOT NULL
);
CREATE TABLE IF NOT EXISTS "public"."notifications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "type" "text" NOT NULL,
    "title" "text",
    "message" "text",
    "read" boolean DEFAULT false,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp without time zone DEFAULT "now"()
);
CREATE TABLE IF NOT EXISTS "public"."offers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "part_id" "uuid" NOT NULL,
    "buyer_id" "uuid" NOT NULL,
    "seller_id" "uuid" NOT NULL,
    "amount_mxn" integer NOT NULL,
    "message" "text",
    "status" "text" DEFAULT 'pending'::"text",
    "created_at" timestamp without time zone DEFAULT "now"(),
    "updated_at" timestamp without time zone DEFAULT "now"(),
    "deleted_at" timestamp with time zone,
    CONSTRAINT "offers_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'accepted'::"text", 'declined'::"text", 'countered'::"text"])))
);
CREATE TABLE IF NOT EXISTS "public"."part_fitment" (
    "part_id" "uuid" NOT NULL,
    "vehicle_variant_id" "uuid" NOT NULL
);
CREATE TABLE IF NOT EXISTS "public"."part_images" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "part_id" "uuid",
    "url" "text",
    "is_primary" boolean DEFAULT false,
    "created_at" timestamp without time zone DEFAULT "now"()
);
CREATE TABLE IF NOT EXISTS "public"."part_specifications" (
    "part_id" "uuid" NOT NULL,
    "spec_definition_id" "uuid" NOT NULL,
    "value_text" "text",
    "value_number" numeric,
    "value_boolean" boolean,
    CONSTRAINT "one_value_populated" CHECK ((((
CASE
    WHEN ("value_text" IS NOT NULL) THEN 1
    ELSE 0
END +
CASE
    WHEN ("value_number" IS NOT NULL) THEN 1
    ELSE 0
END) +
CASE
    WHEN ("value_boolean" IS NOT NULL) THEN 1
    ELSE 0
END) = 1))
);
CREATE TABLE IF NOT EXISTS "public"."part_types" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "category_id" "uuid",
    "name" character varying(255) NOT NULL,
    "slug" character varying(255) NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "name_es" "text",
    "name_en" "text",
    "slug_es" "text",
    "slug_en" "text"
);
CREATE TABLE IF NOT EXISTS "public"."parts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "seller_id" "uuid" DEFAULT "auth"."uid"(),
    "status" "public"."part_status" DEFAULT 'DRAFT'::"public"."part_status",
    "title" "text",
    "description" "text",
    "ai_data" "jsonb",
    "price_mxn" integer,
    "created_at" timestamp without time zone DEFAULT "now"(),
    "updated_at" timestamp without time zone DEFAULT "now"(),
    "searchable_text" "text",
    "part_type_id" "uuid",
    "donor_vehicle_variant_id" "uuid",
    "deleted_at" timestamp with time zone,
    "views" integer DEFAULT 0,
    "condition" "public"."part_condition",
    "listing_quality_score" integer DEFAULT 0,
    "category_id" "uuid",
    "listing_id" "uuid",
    CONSTRAINT "parts_condition_check" CHECK (("condition" = ANY (ARRAY['NEW'::"public"."part_condition", 'REMANUFACTURED'::"public"."part_condition", 'USED_EXCELLENT'::"public"."part_condition", 'USED_GOOD'::"public"."part_condition", 'USED_FAIR'::"public"."part_condition", 'FOR_PARTS'::"public"."part_condition"]))),
    CONSTRAINT "parts_status_check" CHECK (("status" = ANY (ARRAY['DRAFT'::"public"."part_status", 'PENDING_REVIEW'::"public"."part_status", 'AVAILABLE'::"public"."part_status", 'RESERVED'::"public"."part_status", 'SOLD'::"public"."part_status", 'REMOVED'::"public"."part_status", 'ARCHIVED'::"public"."part_status"])))
);
COMMENT ON COLUMN "public"."parts"."listing_quality_score" IS 'Calculated listing completeness/appeal score (0-100)';
CREATE TABLE IF NOT EXISTS "public"."risk_scores" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "transaction_id" "uuid",
    "score" numeric NOT NULL,
    "level" "text",
    "signals" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp without time zone DEFAULT "now"()
);
CREATE TABLE IF NOT EXISTS "public"."search_audit_runs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "started_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "completed_at" timestamp with time zone,
    "missing_documents" integer DEFAULT 0,
    "stale_documents" integer DEFAULT 0,
    "duplicates" integer DEFAULT 0,
    "drift_percent" numeric(5,2)
);
CREATE TABLE IF NOT EXISTS "public"."search_click_events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "search_event_id" "uuid",
    "part_id" "uuid",
    "position" integer,
    "created_at" timestamp with time zone DEFAULT "now"()
);
CREATE TABLE IF NOT EXISTS "public"."search_events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "query" "text" NOT NULL,
    "filters" "jsonb",
    "result_count" integer,
    "session_id" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "latency_ms" integer,
    "trace_id" "text",
    "search_provider" "text",
    "page" integer,
    "results_returned" integer,
    "zero_results" boolean DEFAULT false
);
CREATE TABLE IF NOT EXISTS "public"."search_outbox" (
    "id" bigint NOT NULL,
    "aggregate_type" "text" NOT NULL,
    "aggregate_id" "uuid" NOT NULL,
    "event_type" "text" NOT NULL,
    "payload" "jsonb",
    "processed" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "processed_at" timestamp with time zone,
    "attempts" integer DEFAULT 0,
    "last_error" "text",
    "worker_id" "text",
    "trace_id" "text",
    "retry_count" integer DEFAULT 0 NOT NULL
);
CREATE SEQUENCE IF NOT EXISTS "public"."search_outbox_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE "public"."search_outbox_id_seq" OWNED BY "public"."search_outbox"."id";
CREATE TABLE IF NOT EXISTS "public"."search_request_metrics" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "request_id" "text" NOT NULL,
    "query" "text",
    "latency_ms" integer NOT NULL,
    "result_count" integer,
    "created_at" timestamp with time zone DEFAULT "now"()
);
CREATE TABLE IF NOT EXISTS "public"."search_worker_runs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "started_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "completed_at" timestamp with time zone,
    "documents_processed" integer DEFAULT 0,
    "documents_failed" integer DEFAULT 0,
    "retry_count" integer DEFAULT 0,
    "duration_ms" integer
);
CREATE TABLE IF NOT EXISTS "public"."seller_profiles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "business_name" "text" NOT NULL,
    "tax_country" "text",
    "stripe_account_id" "text",
    "stripe_onboarding_status" "text" DEFAULT 'not_started'::"text",
    "verification_status" "text" DEFAULT 'pending'::"text",
    "created_at" timestamp without time zone DEFAULT "now"(),
    "updated_at" timestamp without time zone DEFAULT "now"(),
    "location" "text",
    "whatsapp" "text",
    "deleted_at" timestamp with time zone,
    "seller_trust_score" integer DEFAULT 40,
    CONSTRAINT "seller_profiles_stripe_onboarding_status_check" CHECK (("stripe_onboarding_status" = ANY (ARRAY['not_started'::"text", 'pending'::"text", 'complete'::"text", 'restricted'::"text"]))),
    CONSTRAINT "seller_profiles_tax_country_check" CHECK (("tax_country" = ANY (ARRAY['MX'::"text", 'US'::"text"]))),
    CONSTRAINT "seller_profiles_verification_status_check" CHECK (("verification_status" = ANY (ARRAY['pending'::"text", 'in_review'::"text", 'verified'::"text", 'rejected'::"text", 'suspended'::"text"])))
);
COMMENT ON COLUMN "public"."seller_profiles"."seller_trust_score" IS 'Calculated reputation score for search ranking (0-100)';
CREATE TABLE IF NOT EXISTS "public"."seller_reviews" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "transaction_id" "uuid" NOT NULL,
    "reviewer_id" "uuid" NOT NULL,
    "seller_id" "uuid" NOT NULL,
    "rating" integer NOT NULL,
    "comment" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "seller_reviews_rating_check" CHECK ((("rating" >= 1) AND ("rating" <= 5)))
);
CREATE MATERIALIZED VIEW "public"."seller_search_signals" AS
 SELECT "seller_id",
    ("avg"("rating"))::numeric(3,2) AS "seller_rating_avg",
    ("count"("id"))::integer AS "seller_review_count"
   FROM "public"."seller_reviews" "sr"
  GROUP BY "seller_id"
  WITH NO DATA;
CREATE TABLE IF NOT EXISTS "public"."shipments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "transaction_id" "uuid",
    "carrier" "text",
    "tracking_number" "text",
    "status" "text" DEFAULT 'pending'::"text",
    "created_at" timestamp without time zone DEFAULT "now"(),
    "updated_at" timestamp without time zone DEFAULT "now"(),
    CONSTRAINT "shipments_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'in_transit'::"text", 'delivered'::"text", 'returned'::"text"])))
);
CREATE TABLE IF NOT EXISTS "public"."transaction_history" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "transaction_id" "uuid",
    "from_status" "text",
    "to_status" "text",
    "created_at" timestamp without time zone DEFAULT "now"()
);
CREATE TABLE IF NOT EXISTS "public"."transactions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "buyer_id" "uuid",
    "seller_id" "uuid",
    "part_id" "uuid",
    "amount_mxn" integer,
    "stripe_payment_intent_id" "text",
    "status" "text",
    "idempotency_key" "text",
    "created_at" timestamp without time zone DEFAULT "now"(),
    "updated_at" timestamp without time zone DEFAULT "now"(),
    "delivered_at" timestamp without time zone,
    "deleted_at" timestamp with time zone,
    CONSTRAINT "transactions_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'requires_capture'::"text", 'succeeded'::"text", 'failed'::"text", 'refunded'::"text", 'held_in_vault'::"text", 'delivered'::"text"])))
);
CREATE TABLE IF NOT EXISTS "public"."trust_profiles" (
    "user_id" "uuid" NOT NULL,
    "trust_score" numeric DEFAULT 50,
    "level" "text" DEFAULT 'neutral'::"text",
    "total_transactions" integer DEFAULT 0,
    "successful_transactions" integer DEFAULT 0,
    "disputes" integer DEFAULT 0,
    "updated_at" timestamp without time zone DEFAULT "now"()
);
CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" NOT NULL,
    "email" "text" NOT NULL,
    "full_name" "text",
    "role" "text" DEFAULT 'buyer'::"text",
    "account_status" "text" DEFAULT 'active'::"text",
    "avatar_url" "text",
    "created_at" timestamp without time zone DEFAULT "now"(),
    "updated_at" timestamp without time zone DEFAULT "now"(),
    "deleted_at" timestamp with time zone,
    CONSTRAINT "users_account_status_check" CHECK (("account_status" = ANY (ARRAY['active'::"text", 'suspended'::"text", 'deactivated'::"text"]))),
    CONSTRAINT "users_role_check" CHECK (("role" = ANY (ARRAY['buyer'::"text", 'seller'::"text", 'admin'::"text"])))
);
CREATE TABLE IF NOT EXISTS "public"."vehicle_variants" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "model_id" "uuid",
    "year" integer NOT NULL
);
ALTER TABLE ONLY "public"."audit_log" ATTACH PARTITION "public"."audit_log_2026_06" FOR VALUES FROM ('2026-06-01 00:00:00+00') TO ('2026-07-01 00:00:00+00');
ALTER TABLE ONLY "public"."audit_log" ATTACH PARTITION "public"."audit_log_2026_07" FOR VALUES FROM ('2026-07-01 00:00:00+00') TO ('2026-08-01 00:00:00+00');
ALTER TABLE ONLY "public"."search_outbox" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."search_outbox_id_seq"'::"regclass");
ALTER TABLE ONLY "public"."ai_scans"
    ADD CONSTRAINT "ai_scans_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."audit_log"
    ADD CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id", "created_at");
ALTER TABLE ONLY "public"."audit_log_2026_06"
    ADD CONSTRAINT "audit_log_2026_06_pkey" PRIMARY KEY ("id", "created_at");
ALTER TABLE ONLY "public"."audit_log_2026_07"
    ADD CONSTRAINT "audit_log_2026_07_pkey" PRIMARY KEY ("id", "created_at");
ALTER TABLE ONLY "public"."catalog_categories"
    ADD CONSTRAINT "catalog_categories_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."catalog_categories"
    ADD CONSTRAINT "catalog_categories_slug_key" UNIQUE ("slug");
ALTER TABLE ONLY "public"."catalog_category_specs"
    ADD CONSTRAINT "catalog_category_specs_pkey" PRIMARY KEY ("category_id", "spec_definition_id");
ALTER TABLE ONLY "public"."catalog_spec_definitions"
    ADD CONSTRAINT "catalog_spec_definitions_key_key" UNIQUE ("key");
ALTER TABLE ONLY "public"."catalog_spec_definitions"
    ADD CONSTRAINT "catalog_spec_definitions_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."catalog_spec_options"
    ADD CONSTRAINT "catalog_spec_options_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."catalog_spec_options"
    ADD CONSTRAINT "catalog_spec_options_spec_definition_id_value_key" UNIQUE ("spec_definition_id", "value");
ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_name_key" UNIQUE ("name");
ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_name_unique" UNIQUE ("name");
ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_slug_key" UNIQUE ("slug");
ALTER TABLE ONLY "public"."conversations"
    ADD CONSTRAINT "conversations_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."disputes"
    ADD CONSTRAINT "disputes_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."events"
    ADD CONSTRAINT "events_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."fraud_events"
    ADD CONSTRAINT "fraud_events_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."listing_specifications"
    ADD CONSTRAINT "listing_specifications_pkey" PRIMARY KEY ("listing_id", "spec_definition_id");
ALTER TABLE ONLY "public"."listings"
    ADD CONSTRAINT "listings_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."makes"
    ADD CONSTRAINT "makes_name_key" UNIQUE ("name");
ALTER TABLE ONLY "public"."makes"
    ADD CONSTRAINT "makes_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."models"
    ADD CONSTRAINT "models_make_id_name_key" UNIQUE ("make_id", "name");
ALTER TABLE ONLY "public"."models"
    ADD CONSTRAINT "models_make_id_name_unique" UNIQUE ("make_id", "name");
ALTER TABLE ONLY "public"."models"
    ADD CONSTRAINT "models_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."offers"
    ADD CONSTRAINT "offers_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."part_fitment"
    ADD CONSTRAINT "part_fitment_pkey" PRIMARY KEY ("part_id", "vehicle_variant_id");
ALTER TABLE ONLY "public"."part_images"
    ADD CONSTRAINT "part_images_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."part_specifications"
    ADD CONSTRAINT "part_specifications_pkey" PRIMARY KEY ("part_id", "spec_definition_id");
ALTER TABLE ONLY "public"."part_types"
    ADD CONSTRAINT "part_types_category_id_name_key" UNIQUE ("category_id", "name");
ALTER TABLE ONLY "public"."part_types"
    ADD CONSTRAINT "part_types_category_id_name_unique" UNIQUE ("category_id", "name");
ALTER TABLE ONLY "public"."part_types"
    ADD CONSTRAINT "part_types_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."parts"
    ADD CONSTRAINT "parts_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."risk_scores"
    ADD CONSTRAINT "risk_scores_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."search_audit_runs"
    ADD CONSTRAINT "search_audit_runs_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."search_click_events"
    ADD CONSTRAINT "search_click_events_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."search_events"
    ADD CONSTRAINT "search_events_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."search_outbox"
    ADD CONSTRAINT "search_outbox_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."search_request_metrics"
    ADD CONSTRAINT "search_request_metrics_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."search_worker_runs"
    ADD CONSTRAINT "search_worker_runs_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."seller_profiles"
    ADD CONSTRAINT "seller_profiles_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."seller_profiles"
    ADD CONSTRAINT "seller_profiles_user_id_key" UNIQUE ("user_id");
ALTER TABLE ONLY "public"."seller_reviews"
    ADD CONSTRAINT "seller_reviews_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."seller_reviews"
    ADD CONSTRAINT "seller_reviews_transaction_id_key" UNIQUE ("transaction_id");
ALTER TABLE ONLY "public"."shipments"
    ADD CONSTRAINT "shipments_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."transaction_history"
    ADD CONSTRAINT "transaction_history_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."transactions"
    ADD CONSTRAINT "transactions_idempotency_key_key" UNIQUE ("idempotency_key");
ALTER TABLE ONLY "public"."transactions"
    ADD CONSTRAINT "transactions_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."transactions"
    ADD CONSTRAINT "transactions_stripe_payment_intent_id_key" UNIQUE ("stripe_payment_intent_id");
ALTER TABLE ONLY "public"."trust_profiles"
    ADD CONSTRAINT "trust_profiles_pkey" PRIMARY KEY ("user_id");
ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "unique_category_name" UNIQUE ("name");
ALTER TABLE ONLY "public"."makes"
    ADD CONSTRAINT "unique_make_name" UNIQUE ("name");
ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_email_key" UNIQUE ("email");
ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."vehicle_variants"
    ADD CONSTRAINT "vehicle_variants_model_id_year_key" UNIQUE ("model_id", "year");
ALTER TABLE ONLY "public"."vehicle_variants"
    ADD CONSTRAINT "vehicle_variants_model_id_year_unique" UNIQUE ("model_id", "year");
ALTER TABLE ONLY "public"."vehicle_variants"
    ADD CONSTRAINT "vehicle_variants_pkey" PRIMARY KEY ("id");
CREATE INDEX "idx_catalog_spec_definitions_key" ON "public"."catalog_spec_definitions" USING "btree" ("key");
CREATE INDEX "idx_conversations_buyer" ON "public"."conversations" USING "btree" ("buyer_id");
CREATE INDEX "idx_conversations_deleted_at" ON "public"."conversations" USING "btree" ("deleted_at");
CREATE INDEX "idx_conversations_participants" ON "public"."conversations" USING "btree" ("buyer_id", "seller_id");
CREATE INDEX "idx_conversations_seller" ON "public"."conversations" USING "btree" ("seller_id");
CREATE INDEX "idx_fraud_tx" ON "public"."fraud_events" USING "btree" ("transaction_id");
CREATE INDEX "idx_fraud_user" ON "public"."fraud_events" USING "btree" ("user_id");
CREATE INDEX "idx_listing_specifications_listing_id" ON "public"."listing_specifications" USING "btree" ("listing_id");
CREATE INDEX "idx_listings_seller_id" ON "public"."listings" USING "btree" ("seller_id");
CREATE INDEX "idx_messages_conversation" ON "public"."messages" USING "btree" ("conversation_id", "created_at");
CREATE INDEX "idx_messages_deleted_at" ON "public"."messages" USING "btree" ("deleted_at");
CREATE INDEX "idx_models_make_id" ON "public"."models" USING "btree" ("make_id");
CREATE INDEX "idx_notifications_unread" ON "public"."notifications" USING "btree" ("user_id", "read") WHERE ("read" = false);
CREATE INDEX "idx_notifications_user" ON "public"."notifications" USING "btree" ("user_id");
CREATE INDEX "idx_offers_buyer" ON "public"."offers" USING "btree" ("buyer_id");
CREATE INDEX "idx_offers_deleted_at" ON "public"."offers" USING "btree" ("deleted_at");
CREATE INDEX "idx_offers_part" ON "public"."offers" USING "btree" ("part_id");
CREATE INDEX "idx_offers_seller" ON "public"."offers" USING "btree" ("seller_id");
CREATE INDEX "idx_offers_status" ON "public"."offers" USING "btree" ("status");
CREATE INDEX "idx_part_fitment_composite" ON "public"."part_fitment" USING "btree" ("part_id", "vehicle_variant_id");
CREATE INDEX "idx_part_fitment_part_id" ON "public"."part_fitment" USING "btree" ("part_id");
CREATE INDEX "idx_part_fitment_variant_id" ON "public"."part_fitment" USING "btree" ("vehicle_variant_id");
CREATE INDEX "idx_part_fitment_vehicle_id" ON "public"."part_fitment" USING "btree" ("vehicle_variant_id");
CREATE INDEX "idx_part_specifications_spec_definition_id" ON "public"."part_specifications" USING "btree" ("spec_definition_id");
CREATE INDEX "idx_part_types_category_id" ON "public"."part_types" USING "btree" ("category_id");
CREATE INDEX "idx_parts_category_id" ON "public"."parts" USING "btree" ("category_id");
CREATE INDEX "idx_parts_created" ON "public"."parts" USING "btree" ("created_at" DESC);
CREATE INDEX "idx_parts_created_at" ON "public"."parts" USING "btree" ("created_at" DESC);
CREATE INDEX "idx_parts_donor_variant" ON "public"."parts" USING "btree" ("donor_vehicle_variant_id");
CREATE INDEX "idx_parts_donor_variant_id" ON "public"."parts" USING "btree" ("donor_vehicle_variant_id");
CREATE INDEX "idx_parts_part_type" ON "public"."parts" USING "btree" ("part_type_id");
CREATE INDEX "idx_parts_part_type_id" ON "public"."parts" USING "btree" ("part_type_id");
CREATE INDEX "idx_parts_searchable_text" ON "public"."parts" USING "gin" ("to_tsvector"('"spanish"'::"regconfig", "searchable_text"));
CREATE INDEX "idx_parts_seller" ON "public"."parts" USING "btree" ("seller_id");
CREATE INDEX "idx_parts_status" ON "public"."parts" USING "btree" ("status");
CREATE INDEX "idx_parts_type" ON "public"."parts" USING "btree" ("part_type_id");
CREATE INDEX "idx_parts_variant" ON "public"."parts" USING "btree" ("donor_vehicle_variant_id");
CREATE INDEX "idx_reviews_seller" ON "public"."seller_reviews" USING "btree" ("seller_id");
CREATE INDEX "idx_risk_tx" ON "public"."risk_scores" USING "btree" ("transaction_id");
CREATE INDEX "idx_risk_user" ON "public"."risk_scores" USING "btree" ("user_id");
CREATE INDEX "idx_search_outbox_retry" ON "public"."search_outbox" USING "btree" ("retry_count", "processed");
CREATE INDEX "idx_search_outbox_unprocessed" ON "public"."search_outbox" USING "btree" ("processed", "created_at");
CREATE UNIQUE INDEX "idx_seller_search_signals_seller_id" ON "public"."seller_search_signals" USING "btree" ("seller_id");
CREATE INDEX "idx_shipments_tx" ON "public"."shipments" USING "btree" ("transaction_id");
CREATE INDEX "idx_transactions_buyer" ON "public"."transactions" USING "btree" ("buyer_id");
CREATE INDEX "idx_transactions_created" ON "public"."transactions" USING "btree" ("created_at" DESC);
CREATE INDEX "idx_transactions_deleted_at" ON "public"."transactions" USING "btree" ("deleted_at");
CREATE INDEX "idx_transactions_seller" ON "public"."transactions" USING "btree" ("seller_id");
CREATE INDEX "idx_transactions_status" ON "public"."transactions" USING "btree" ("status");
CREATE INDEX "idx_variants_model_id" ON "public"."vehicle_variants" USING "btree" ("model_id");
CREATE INDEX "idx_vehicle_variants_lookup" ON "public"."vehicle_variants" USING "btree" ("model_id", "year");
CREATE INDEX "idx_vehicle_variants_model_id" ON "public"."vehicle_variants" USING "btree" ("model_id");
CREATE UNIQUE INDEX "unique_active_part" ON "public"."transactions" USING "btree" ("part_id") WHERE ("status" = ANY (ARRAY['pending_payment'::"text", 'held_in_vault'::"text", 'shipped'::"text"]));
ALTER INDEX "public"."audit_log_pkey" ATTACH PARTITION "public"."audit_log_2026_06_pkey";
ALTER INDEX "public"."audit_log_pkey" ATTACH PARTITION "public"."audit_log_2026_07_pkey";
CREATE OR REPLACE TRIGGER "tr_parts_search_outbox" AFTER INSERT OR DELETE OR UPDATE ON "public"."parts" FOR EACH ROW EXECUTE FUNCTION "public"."fn_enqueue_search_event"();
CREATE OR REPLACE TRIGGER "trg_audit_offers" AFTER INSERT OR DELETE OR UPDATE ON "public"."offers" FOR EACH ROW EXECUTE FUNCTION "public"."fn_audit_log_changes"();
CREATE OR REPLACE TRIGGER "trg_audit_parts" AFTER INSERT OR DELETE OR UPDATE ON "public"."parts" FOR EACH ROW EXECUTE FUNCTION "public"."fn_audit_log_changes"();
CREATE OR REPLACE TRIGGER "trg_audit_seller_profiles" AFTER INSERT OR DELETE OR UPDATE ON "public"."seller_profiles" FOR EACH ROW EXECUTE FUNCTION "public"."fn_audit_log_changes"();
CREATE OR REPLACE TRIGGER "trg_audit_transactions" AFTER INSERT OR DELETE OR UPDATE ON "public"."transactions" FOR EACH ROW EXECUTE FUNCTION "public"."fn_audit_log_changes"();
CREATE OR REPLACE TRIGGER "trg_transactions_sale_lock" AFTER INSERT OR UPDATE OF "status" ON "public"."transactions" FOR EACH ROW EXECUTE FUNCTION "public"."handle_part_sale_lock"();
CREATE OR REPLACE TRIGGER "trg_validate_transaction_seller" BEFORE INSERT OR UPDATE ON "public"."transactions" FOR EACH ROW EXECUTE FUNCTION "public"."validate_transaction_seller"();
ALTER TABLE ONLY "public"."ai_scans"
    ADD CONSTRAINT "ai_scans_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;
ALTER TABLE ONLY "public"."catalog_categories"
    ADD CONSTRAINT "catalog_categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."catalog_categories"("id");
ALTER TABLE ONLY "public"."catalog_category_specs"
    ADD CONSTRAINT "catalog_category_specs_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."catalog_categories"("id") ON DELETE CASCADE;
ALTER TABLE ONLY "public"."catalog_category_specs"
    ADD CONSTRAINT "catalog_category_specs_spec_definition_id_fkey" FOREIGN KEY ("spec_definition_id") REFERENCES "public"."catalog_spec_definitions"("id") ON DELETE CASCADE;
ALTER TABLE ONLY "public"."catalog_spec_options"
    ADD CONSTRAINT "catalog_spec_options_spec_definition_id_fkey" FOREIGN KEY ("spec_definition_id") REFERENCES "public"."catalog_spec_definitions"("id") ON DELETE CASCADE;
ALTER TABLE ONLY "public"."conversations"
    ADD CONSTRAINT "conversations_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "public"."users"("id");
ALTER TABLE ONLY "public"."conversations"
    ADD CONSTRAINT "conversations_part_id_fkey" FOREIGN KEY ("part_id") REFERENCES "public"."parts"("id") ON DELETE CASCADE;
ALTER TABLE ONLY "public"."conversations"
    ADD CONSTRAINT "conversations_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "public"."users"("id");
ALTER TABLE ONLY "public"."disputes"
    ADD CONSTRAINT "disputes_opened_by_fkey" FOREIGN KEY ("opened_by") REFERENCES "public"."users"("id");
ALTER TABLE ONLY "public"."disputes"
    ADD CONSTRAINT "disputes_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "public"."transactions"("id");
ALTER TABLE ONLY "public"."listing_specifications"
    ADD CONSTRAINT "listing_specifications_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE CASCADE;
ALTER TABLE ONLY "public"."listing_specifications"
    ADD CONSTRAINT "listing_specifications_spec_definition_id_fkey" FOREIGN KEY ("spec_definition_id") REFERENCES "public"."catalog_spec_definitions"("id") ON DELETE CASCADE;
ALTER TABLE ONLY "public"."listings"
    ADD CONSTRAINT "listings_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "public"."seller_profiles"("user_id");
ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE CASCADE;
ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id");
ALTER TABLE ONLY "public"."models"
    ADD CONSTRAINT "models_make_id_fkey" FOREIGN KEY ("make_id") REFERENCES "public"."makes"("id") ON DELETE CASCADE;
ALTER TABLE ONLY "public"."offers"
    ADD CONSTRAINT "offers_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "public"."users"("id");
ALTER TABLE ONLY "public"."offers"
    ADD CONSTRAINT "offers_part_id_fkey" FOREIGN KEY ("part_id") REFERENCES "public"."parts"("id") ON DELETE CASCADE;
ALTER TABLE ONLY "public"."offers"
    ADD CONSTRAINT "offers_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "public"."users"("id");
ALTER TABLE ONLY "public"."part_fitment"
    ADD CONSTRAINT "part_fitment_part_id_fkey" FOREIGN KEY ("part_id") REFERENCES "public"."parts"("id") ON DELETE CASCADE;
ALTER TABLE ONLY "public"."part_fitment"
    ADD CONSTRAINT "part_fitment_vehicle_variant_id_fkey" FOREIGN KEY ("vehicle_variant_id") REFERENCES "public"."vehicle_variants"("id") ON DELETE CASCADE;
ALTER TABLE ONLY "public"."part_images"
    ADD CONSTRAINT "part_images_part_id_fkey" FOREIGN KEY ("part_id") REFERENCES "public"."parts"("id") ON DELETE CASCADE;
ALTER TABLE ONLY "public"."part_specifications"
    ADD CONSTRAINT "part_specifications_part_id_fkey" FOREIGN KEY ("part_id") REFERENCES "public"."parts"("id") ON DELETE CASCADE;
ALTER TABLE ONLY "public"."part_specifications"
    ADD CONSTRAINT "part_specifications_spec_definition_id_fkey" FOREIGN KEY ("spec_definition_id") REFERENCES "public"."catalog_spec_definitions"("id") ON DELETE CASCADE;
ALTER TABLE ONLY "public"."part_types"
    ADD CONSTRAINT "part_types_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE CASCADE;
ALTER TABLE ONLY "public"."parts"
    ADD CONSTRAINT "parts_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."catalog_categories"("id");
ALTER TABLE ONLY "public"."parts"
    ADD CONSTRAINT "parts_donor_vehicle_variant_id_fkey" FOREIGN KEY ("donor_vehicle_variant_id") REFERENCES "public"."vehicle_variants"("id") ON DELETE SET NULL;
ALTER TABLE ONLY "public"."parts"
    ADD CONSTRAINT "parts_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id");
ALTER TABLE ONLY "public"."parts"
    ADD CONSTRAINT "parts_part_type_id_fkey" FOREIGN KEY ("part_type_id") REFERENCES "public"."part_types"("id") ON DELETE SET NULL;
ALTER TABLE ONLY "public"."parts"
    ADD CONSTRAINT "parts_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;
ALTER TABLE ONLY "public"."risk_scores"
    ADD CONSTRAINT "risk_scores_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "public"."transactions"("id");
ALTER TABLE ONLY "public"."risk_scores"
    ADD CONSTRAINT "risk_scores_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");
ALTER TABLE ONLY "public"."search_click_events"
    ADD CONSTRAINT "search_click_events_part_id_fkey" FOREIGN KEY ("part_id") REFERENCES "public"."parts"("id");
ALTER TABLE ONLY "public"."search_click_events"
    ADD CONSTRAINT "search_click_events_search_event_id_fkey" FOREIGN KEY ("search_event_id") REFERENCES "public"."search_events"("id");
ALTER TABLE ONLY "public"."seller_profiles"
    ADD CONSTRAINT "seller_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;
ALTER TABLE ONLY "public"."seller_reviews"
    ADD CONSTRAINT "seller_reviews_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "public"."users"("id");
ALTER TABLE ONLY "public"."seller_reviews"
    ADD CONSTRAINT "seller_reviews_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "public"."seller_profiles"("user_id");
ALTER TABLE ONLY "public"."seller_reviews"
    ADD CONSTRAINT "seller_reviews_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "public"."transactions"("id");
ALTER TABLE ONLY "public"."shipments"
    ADD CONSTRAINT "shipments_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "public"."transactions"("id");
ALTER TABLE ONLY "public"."transaction_history"
    ADD CONSTRAINT "transaction_history_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "public"."transactions"("id");
ALTER TABLE ONLY "public"."transactions"
    ADD CONSTRAINT "transactions_part_id_fkey" FOREIGN KEY ("part_id") REFERENCES "public"."parts"("id");
ALTER TABLE ONLY "public"."transactions"
    ADD CONSTRAINT "transactions_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "public"."users"("id");
ALTER TABLE ONLY "public"."trust_profiles"
    ADD CONSTRAINT "trust_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");
ALTER TABLE ONLY "public"."vehicle_variants"
    ADD CONSTRAINT "vehicle_variants_model_id_fkey" FOREIGN KEY ("model_id") REFERENCES "public"."models"("id") ON DELETE CASCADE;
CREATE POLICY "Buyers can create offers" ON "public"."offers" FOR INSERT WITH CHECK (("auth"."uid"() = "buyer_id"));
CREATE POLICY "Public offers are private" ON "public"."offers" FOR SELECT USING (((("auth"."uid"() = "buyer_id") OR ("auth"."uid"() = "seller_id")) AND ("deleted_at" IS NULL)));
CREATE POLICY "Public read access" ON "public"."categories" FOR SELECT USING (true);
CREATE POLICY "Public read access" ON "public"."makes" FOR SELECT USING (true);
CREATE POLICY "Public read access" ON "public"."models" FOR SELECT USING (true);
CREATE POLICY "Public read access" ON "public"."part_fitment" FOR SELECT USING (true);
CREATE POLICY "Public read access" ON "public"."part_images" FOR SELECT USING (true);
CREATE POLICY "Public read access" ON "public"."part_types" FOR SELECT USING (true);
CREATE POLICY "Public read access" ON "public"."vehicle_variants" FOR SELECT USING (true);
CREATE POLICY "Users can insert conversations" ON "public"."conversations" FOR INSERT WITH CHECK (("auth"."uid"() = "buyer_id"));
CREATE POLICY "Users can insert messages in their conversations" ON "public"."messages" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."conversations" "c"
  WHERE (("c"."id" = "messages"."conversation_id") AND (("c"."buyer_id" = "auth"."uid"()) OR ("c"."seller_id" = "auth"."uid"()))))));
CREATE POLICY "Users can view messages in their conversations" ON "public"."messages" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM "public"."conversations" "c"
  WHERE (("c"."id" = "messages"."conversation_id") AND (("c"."buyer_id" = "auth"."uid"()) OR ("c"."seller_id" = "auth"."uid"())) AND ("c"."deleted_at" IS NULL)))) AND ("deleted_at" IS NULL)));
CREATE POLICY "Users can view their own ai scans" ON "public"."ai_scans" FOR SELECT USING (("auth"."uid"() = "user_id"));
CREATE POLICY "Users can view their own conversations" ON "public"."conversations" FOR SELECT USING (((("auth"."uid"() = "buyer_id") OR ("auth"."uid"() = "seller_id")) AND ("deleted_at" IS NULL)));
CREATE POLICY "Users can view their own events" ON "public"."events" FOR SELECT USING (("auth"."uid"() = "user_id"));
CREATE POLICY "Users can view their own fraud events" ON "public"."fraud_events" FOR SELECT USING (("auth"."uid"() = "user_id"));
CREATE POLICY "Users can view their own notifications" ON "public"."notifications" FOR SELECT USING (("auth"."uid"() = "user_id"));
CREATE POLICY "Users can view their own profile" ON "public"."users" FOR SELECT USING (("auth"."uid"() = "id"));
CREATE POLICY "Users can view their own risk scores" ON "public"."risk_scores" FOR SELECT USING (("auth"."uid"() = "user_id"));
CREATE POLICY "Users can view their own seller profile" ON "public"."seller_profiles" FOR SELECT USING (("auth"."uid"() = "user_id"));
CREATE POLICY "Users can view their own shipments" ON "public"."shipments" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."transactions" "t"
  WHERE (("t"."id" = "shipments"."transaction_id") AND (("t"."buyer_id" = "auth"."uid"()) OR ("t"."seller_id" = "auth"."uid"()))))));
CREATE POLICY "Users can view their own transaction history" ON "public"."transaction_history" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."transactions" "t"
  WHERE (("t"."id" = "transaction_history"."transaction_id") AND (("t"."buyer_id" = "auth"."uid"()) OR ("t"."seller_id" = "auth"."uid"()))))));
CREATE POLICY "Users can view their own transactions" ON "public"."transactions" FOR SELECT USING (((("auth"."uid"() = "buyer_id") OR ("auth"."uid"() = "seller_id")) AND ("deleted_at" IS NULL)));
CREATE POLICY "Users can view their own trust profile" ON "public"."trust_profiles" FOR SELECT USING (("auth"."uid"() = "user_id"));
CREATE POLICY "ai_owner" ON "public"."ai_scans" USING (("user_id" = "auth"."uid"()));
ALTER TABLE "public"."ai_scans" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."audit_log" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."audit_log_2026_06" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."audit_log_2026_07" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."catalog_categories" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."catalog_category_specs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."catalog_spec_definitions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."catalog_spec_options" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."categories" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."conversations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."disputes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."events" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."fraud_events" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "images_access" ON "public"."part_images" USING ((EXISTS ( SELECT 1
   FROM "public"."parts"
  WHERE (("parts"."id" = "part_images"."part_id") AND ("parts"."seller_id" = "auth"."uid"())))));
ALTER TABLE "public"."listing_specifications" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."listings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."makes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."messages" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."models" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."offers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."part_fitment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."part_images" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."part_specifications" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."part_types" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."parts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."risk_scores" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."search_audit_runs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."search_click_events" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."search_events" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."search_outbox" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."search_request_metrics" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."search_worker_runs" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "seller_owns_profile" ON "public"."seller_profiles" USING (("user_id" = "auth"."uid"()));
ALTER TABLE "public"."seller_profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."seller_reviews" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."shipments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."transaction_history" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."transactions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."trust_profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_select_own" ON "public"."users" FOR SELECT USING (("auth"."uid"() = "id"));
CREATE POLICY "users_update_own" ON "public"."users" FOR UPDATE USING (("auth"."uid"() = "id"));
ALTER TABLE "public"."vehicle_variants" ENABLE ROW LEVEL SECURITY;
GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";
GRANT ALL ON FUNCTION "public"."cleanup_old_notifications"() TO "anon";
GRANT ALL ON FUNCTION "public"."cleanup_old_notifications"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."cleanup_old_notifications"() TO "service_role";
GRANT ALL ON FUNCTION "public"."fn_audit_log_changes"() TO "anon";
GRANT ALL ON FUNCTION "public"."fn_audit_log_changes"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."fn_audit_log_changes"() TO "service_role";
GRANT ALL ON FUNCTION "public"."fn_enqueue_search_event"() TO "anon";
GRANT ALL ON FUNCTION "public"."fn_enqueue_search_event"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."fn_enqueue_search_event"() TO "service_role";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";
GRANT ALL ON FUNCTION "public"."handle_part_sale_lock"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_part_sale_lock"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_part_sale_lock"() TO "service_role";
GRANT ALL ON FUNCTION "public"."refresh_seller_search_signals"() TO "anon";
GRANT ALL ON FUNCTION "public"."refresh_seller_search_signals"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."refresh_seller_search_signals"() TO "service_role";
GRANT ALL ON FUNCTION "public"."validate_transaction_seller"() TO "anon";
GRANT ALL ON FUNCTION "public"."validate_transaction_seller"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_transaction_seller"() TO "service_role";
GRANT ALL ON TABLE "public"."ai_scans" TO "anon";
GRANT ALL ON TABLE "public"."ai_scans" TO "authenticated";
GRANT ALL ON TABLE "public"."ai_scans" TO "service_role";
GRANT ALL ON TABLE "public"."audit_log" TO "anon";
GRANT ALL ON TABLE "public"."audit_log" TO "authenticated";
GRANT ALL ON TABLE "public"."audit_log" TO "service_role";
GRANT ALL ON TABLE "public"."audit_log_2026_06" TO "anon";
GRANT ALL ON TABLE "public"."audit_log_2026_06" TO "authenticated";
GRANT ALL ON TABLE "public"."audit_log_2026_06" TO "service_role";
GRANT ALL ON TABLE "public"."audit_log_2026_07" TO "anon";
GRANT ALL ON TABLE "public"."audit_log_2026_07" TO "authenticated";
GRANT ALL ON TABLE "public"."audit_log_2026_07" TO "service_role";
GRANT ALL ON TABLE "public"."catalog_categories" TO "anon";
GRANT ALL ON TABLE "public"."catalog_categories" TO "authenticated";
GRANT ALL ON TABLE "public"."catalog_categories" TO "service_role";
GRANT ALL ON TABLE "public"."catalog_category_specs" TO "anon";
GRANT ALL ON TABLE "public"."catalog_category_specs" TO "authenticated";
GRANT ALL ON TABLE "public"."catalog_category_specs" TO "service_role";
GRANT ALL ON TABLE "public"."catalog_spec_definitions" TO "anon";
GRANT ALL ON TABLE "public"."catalog_spec_definitions" TO "authenticated";
GRANT ALL ON TABLE "public"."catalog_spec_definitions" TO "service_role";
GRANT ALL ON TABLE "public"."catalog_spec_options" TO "anon";
GRANT ALL ON TABLE "public"."catalog_spec_options" TO "authenticated";
GRANT ALL ON TABLE "public"."catalog_spec_options" TO "service_role";
GRANT ALL ON TABLE "public"."categories" TO "anon";
GRANT ALL ON TABLE "public"."categories" TO "authenticated";
GRANT ALL ON TABLE "public"."categories" TO "service_role";
GRANT ALL ON TABLE "public"."conversations" TO "anon";
GRANT ALL ON TABLE "public"."conversations" TO "authenticated";
GRANT ALL ON TABLE "public"."conversations" TO "service_role";
GRANT ALL ON TABLE "public"."disputes" TO "anon";
GRANT ALL ON TABLE "public"."disputes" TO "authenticated";
GRANT ALL ON TABLE "public"."disputes" TO "service_role";
GRANT ALL ON TABLE "public"."events" TO "anon";
GRANT ALL ON TABLE "public"."events" TO "authenticated";
GRANT ALL ON TABLE "public"."events" TO "service_role";
GRANT ALL ON TABLE "public"."fraud_events" TO "anon";
GRANT ALL ON TABLE "public"."fraud_events" TO "authenticated";
GRANT ALL ON TABLE "public"."fraud_events" TO "service_role";
GRANT ALL ON TABLE "public"."listing_specifications" TO "anon";
GRANT ALL ON TABLE "public"."listing_specifications" TO "authenticated";
GRANT ALL ON TABLE "public"."listing_specifications" TO "service_role";
GRANT ALL ON TABLE "public"."listings" TO "anon";
GRANT ALL ON TABLE "public"."listings" TO "authenticated";
GRANT ALL ON TABLE "public"."listings" TO "service_role";
GRANT ALL ON TABLE "public"."makes" TO "anon";
GRANT ALL ON TABLE "public"."makes" TO "authenticated";
GRANT ALL ON TABLE "public"."makes" TO "service_role";
GRANT ALL ON TABLE "public"."messages" TO "anon";
GRANT ALL ON TABLE "public"."messages" TO "authenticated";
GRANT ALL ON TABLE "public"."messages" TO "service_role";
GRANT ALL ON TABLE "public"."models" TO "anon";
GRANT ALL ON TABLE "public"."models" TO "authenticated";
GRANT ALL ON TABLE "public"."models" TO "service_role";
GRANT ALL ON TABLE "public"."notifications" TO "anon";
GRANT ALL ON TABLE "public"."notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."notifications" TO "service_role";
GRANT ALL ON TABLE "public"."offers" TO "anon";
GRANT ALL ON TABLE "public"."offers" TO "authenticated";
GRANT ALL ON TABLE "public"."offers" TO "service_role";
GRANT ALL ON TABLE "public"."part_fitment" TO "anon";
GRANT ALL ON TABLE "public"."part_fitment" TO "authenticated";
GRANT ALL ON TABLE "public"."part_fitment" TO "service_role";
GRANT ALL ON TABLE "public"."part_images" TO "anon";
GRANT ALL ON TABLE "public"."part_images" TO "authenticated";
GRANT ALL ON TABLE "public"."part_images" TO "service_role";
GRANT ALL ON TABLE "public"."part_specifications" TO "anon";
GRANT ALL ON TABLE "public"."part_specifications" TO "authenticated";
GRANT ALL ON TABLE "public"."part_specifications" TO "service_role";
GRANT ALL ON TABLE "public"."part_types" TO "anon";
GRANT ALL ON TABLE "public"."part_types" TO "authenticated";
GRANT ALL ON TABLE "public"."part_types" TO "service_role";
GRANT ALL ON TABLE "public"."parts" TO "anon";
GRANT ALL ON TABLE "public"."parts" TO "authenticated";
GRANT ALL ON TABLE "public"."parts" TO "service_role";
GRANT ALL ON TABLE "public"."risk_scores" TO "anon";
GRANT ALL ON TABLE "public"."risk_scores" TO "authenticated";
GRANT ALL ON TABLE "public"."risk_scores" TO "service_role";
GRANT ALL ON TABLE "public"."search_audit_runs" TO "anon";
GRANT ALL ON TABLE "public"."search_audit_runs" TO "authenticated";
GRANT ALL ON TABLE "public"."search_audit_runs" TO "service_role";
GRANT ALL ON TABLE "public"."search_click_events" TO "anon";
GRANT ALL ON TABLE "public"."search_click_events" TO "authenticated";
GRANT ALL ON TABLE "public"."search_click_events" TO "service_role";
GRANT ALL ON TABLE "public"."search_events" TO "anon";
GRANT ALL ON TABLE "public"."search_events" TO "authenticated";
GRANT ALL ON TABLE "public"."search_events" TO "service_role";
GRANT ALL ON TABLE "public"."search_outbox" TO "anon";
GRANT ALL ON TABLE "public"."search_outbox" TO "authenticated";
GRANT ALL ON TABLE "public"."search_outbox" TO "service_role";
GRANT ALL ON SEQUENCE "public"."search_outbox_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."search_outbox_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."search_outbox_id_seq" TO "service_role";
GRANT ALL ON TABLE "public"."search_request_metrics" TO "anon";
GRANT ALL ON TABLE "public"."search_request_metrics" TO "authenticated";
GRANT ALL ON TABLE "public"."search_request_metrics" TO "service_role";
GRANT ALL ON TABLE "public"."search_worker_runs" TO "anon";
GRANT ALL ON TABLE "public"."search_worker_runs" TO "authenticated";
GRANT ALL ON TABLE "public"."search_worker_runs" TO "service_role";
GRANT ALL ON TABLE "public"."seller_profiles" TO "anon";
GRANT ALL ON TABLE "public"."seller_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."seller_profiles" TO "service_role";
GRANT ALL ON TABLE "public"."seller_reviews" TO "anon";
GRANT ALL ON TABLE "public"."seller_reviews" TO "authenticated";
GRANT ALL ON TABLE "public"."seller_reviews" TO "service_role";
GRANT ALL ON TABLE "public"."seller_search_signals" TO "anon";
GRANT ALL ON TABLE "public"."seller_search_signals" TO "authenticated";
GRANT ALL ON TABLE "public"."seller_search_signals" TO "service_role";
GRANT ALL ON TABLE "public"."shipments" TO "anon";
GRANT ALL ON TABLE "public"."shipments" TO "authenticated";
GRANT ALL ON TABLE "public"."shipments" TO "service_role";
GRANT ALL ON TABLE "public"."transaction_history" TO "anon";
GRANT ALL ON TABLE "public"."transaction_history" TO "authenticated";
GRANT ALL ON TABLE "public"."transaction_history" TO "service_role";
GRANT ALL ON TABLE "public"."transactions" TO "anon";
GRANT ALL ON TABLE "public"."transactions" TO "authenticated";
GRANT ALL ON TABLE "public"."transactions" TO "service_role";
GRANT ALL ON TABLE "public"."trust_profiles" TO "anon";
GRANT ALL ON TABLE "public"."trust_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."trust_profiles" TO "service_role";
GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";
GRANT ALL ON TABLE "public"."vehicle_variants" TO "anon";
GRANT ALL ON TABLE "public"."vehicle_variants" TO "authenticated";
GRANT ALL ON TABLE "public"."vehicle_variants" TO "service_role";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";
