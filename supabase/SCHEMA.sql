-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.users (
  id uuid NOT NULL,
  email text NOT NULL UNIQUE,
  full_name text,
  role text DEFAULT 'buyer'::text CHECK (role = ANY (ARRAY['buyer'::text, 'seller'::text, 'admin'::text])),
  account_status text DEFAULT 'active'::text CHECK (account_status = ANY (ARRAY['active'::text, 'suspended'::text, 'deactivated'::text])),
  avatar_url text,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT users_pkey PRIMARY KEY (id)
);
CREATE TABLE public.seller_profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  business_name text NOT NULL,
  tax_country text CHECK (tax_country = ANY (ARRAY['MX'::text, 'US'::text])),
  stripe_account_id text,
  stripe_onboarding_status text DEFAULT 'not_started'::text CHECK (stripe_onboarding_status = ANY (ARRAY['not_started'::text, 'pending'::text, 'complete'::text, 'restricted'::text])),
  verification_status text DEFAULT 'pending'::text CHECK (verification_status = ANY (ARRAY['pending'::text, 'in_review'::text, 'verified'::text, 'rejected'::text, 'suspended'::text])),
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  location text,
  whatsapp text,
  deleted_at timestamp with time zone,
  seller_trust_score integer DEFAULT 40,
  CONSTRAINT seller_profiles_pkey PRIMARY KEY (id),
  CONSTRAINT seller_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.ai_scans (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid DEFAULT auth.uid(),
  image_url text,
  status text CHECK (status = ANY (ARRAY['queued'::text, 'processing'::text, 'completed'::text, 'failed'::text])),
  result jsonb,
  error text,
  attempts integer DEFAULT 0,
  created_at timestamp without time zone DEFAULT now(),
  completed_at timestamp without time zone,
  CONSTRAINT ai_scans_pkey PRIMARY KEY (id),
  CONSTRAINT ai_scans_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.parts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  seller_id uuid DEFAULT auth.uid(),
  status text DEFAULT 'draft'::text CHECK (status = ANY (ARRAY['draft'::text, 'pending_review'::text, 'available'::text, 'reserved'::text, 'sold'::text, 'removed'::text, 'archived'::text])),
  title text,
  description text,
  ai_data jsonb,
  price_mxn integer,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  searchable_text text,
  part_type_id uuid,
  donor_vehicle_variant_id uuid,
  deleted_at timestamp with time zone,
  views integer DEFAULT 0,
  condition text CHECK (condition = ANY (ARRAY['new'::text, 'remanufactured'::text, 'used_excellent'::text, 'used_good'::text, 'used_fair'::text, 'for_parts'::text])),
  listing_quality_score integer DEFAULT 0,
  CONSTRAINT parts_pkey PRIMARY KEY (id),
  CONSTRAINT parts_seller_id_fkey FOREIGN KEY (seller_id) REFERENCES public.users(id),
  CONSTRAINT parts_part_type_id_fkey FOREIGN KEY (part_type_id) REFERENCES public.part_types(id),
  CONSTRAINT parts_donor_vehicle_variant_id_fkey FOREIGN KEY (donor_vehicle_variant_id) REFERENCES public.vehicle_variants(id)
);
CREATE TABLE public.part_images (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  part_id uuid,
  url text,
  is_primary boolean DEFAULT false,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT part_images_pkey PRIMARY KEY (id),
  CONSTRAINT part_images_part_id_fkey FOREIGN KEY (part_id) REFERENCES public.parts(id)
);
CREATE TABLE public.transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  buyer_id uuid,
  seller_id uuid,
  part_id uuid,
  amount_mxn integer,
  stripe_payment_intent_id text UNIQUE,
  status text CHECK (status = ANY (ARRAY['pending'::text, 'requires_capture'::text, 'succeeded'::text, 'failed'::text, 'refunded'::text, 'held_in_vault'::text, 'delivered'::text])),
  idempotency_key text UNIQUE,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  delivered_at timestamp without time zone,
  deleted_at timestamp with time zone,
  CONSTRAINT transactions_pkey PRIMARY KEY (id),
  CONSTRAINT transactions_seller_id_fkey FOREIGN KEY (seller_id) REFERENCES public.users(id),
  CONSTRAINT transactions_part_id_fkey FOREIGN KEY (part_id) REFERENCES public.parts(id)
);
CREATE TABLE public.transaction_history (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  transaction_id uuid,
  from_status text,
  to_status text,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT transaction_history_pkey PRIMARY KEY (id),
  CONSTRAINT transaction_history_transaction_id_fkey FOREIGN KEY (transaction_id) REFERENCES public.transactions(id)
);
CREATE TABLE public.shipments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  transaction_id uuid,
  carrier text,
  tracking_number text,
  status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'in_transit'::text, 'delivered'::text, 'returned'::text])),
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT shipments_pkey PRIMARY KEY (id),
  CONSTRAINT shipments_transaction_id_fkey FOREIGN KEY (transaction_id) REFERENCES public.transactions(id)
);
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  type text NOT NULL,
  title text,
  message text,
  read boolean DEFAULT false,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT notifications_pkey PRIMARY KEY (id)
);
CREATE TABLE public.risk_scores (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  transaction_id uuid,
  score numeric NOT NULL,
  level text,
  signals jsonb DEFAULT '{}'::jsonb,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT risk_scores_pkey PRIMARY KEY (id),
  CONSTRAINT risk_scores_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT risk_scores_transaction_id_fkey FOREIGN KEY (transaction_id) REFERENCES public.transactions(id)
);
CREATE TABLE public.fraud_events (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  transaction_id uuid,
  type text,
  severity text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT fraud_events_pkey PRIMARY KEY (id)
);
CREATE TABLE public.trust_profiles (
  user_id uuid NOT NULL,
  trust_score numeric DEFAULT 50,
  level text DEFAULT 'neutral'::text,
  total_transactions integer DEFAULT 0,
  successful_transactions integer DEFAULT 0,
  disputes integer DEFAULT 0,
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT trust_profiles_pkey PRIMARY KEY (user_id),
  CONSTRAINT trust_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.events (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  type text NOT NULL,
  user_id uuid,
  entity_id uuid,
  payload jsonb DEFAULT '{}'::jsonb,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT events_pkey PRIMARY KEY (id)
);
CREATE TABLE public.categories (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL UNIQUE,
  slug character varying NOT NULL UNIQUE,
  icon character varying,
  created_at timestamp with time zone DEFAULT now(),
  name_es text,
  name_en text,
  slug_es text,
  slug_en text,
  CONSTRAINT categories_pkey PRIMARY KEY (id)
);
CREATE TABLE public.part_types (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  category_id uuid,
  name character varying NOT NULL,
  slug character varying NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  name_es text,
  name_en text,
  slug_es text,
  slug_en text,
  CONSTRAINT part_types_pkey PRIMARY KEY (id),
  CONSTRAINT part_types_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id)
);
CREATE TABLE public.makes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL UNIQUE,
  CONSTRAINT makes_pkey PRIMARY KEY (id)
);
CREATE TABLE public.models (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  make_id uuid,
  name character varying NOT NULL,
  CONSTRAINT models_pkey PRIMARY KEY (id),
  CONSTRAINT models_make_id_fkey FOREIGN KEY (make_id) REFERENCES public.makes(id)
);
CREATE TABLE public.vehicle_variants (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  model_id uuid,
  year integer NOT NULL,
  CONSTRAINT vehicle_variants_pkey PRIMARY KEY (id),
  CONSTRAINT vehicle_variants_model_id_fkey FOREIGN KEY (model_id) REFERENCES public.models(id)
);
CREATE TABLE public.part_fitment (
  part_id uuid NOT NULL,
  vehicle_variant_id uuid NOT NULL,
  CONSTRAINT part_fitment_pkey PRIMARY KEY (part_id, vehicle_variant_id),
  CONSTRAINT part_fitment_vehicle_variant_id_fkey FOREIGN KEY (vehicle_variant_id) REFERENCES public.vehicle_variants(id),
  CONSTRAINT part_fitment_part_id_fkey FOREIGN KEY (part_id) REFERENCES public.parts(id)
);
CREATE TABLE public.offers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  part_id uuid NOT NULL,
  buyer_id uuid NOT NULL,
  seller_id uuid NOT NULL,
  amount_mxn integer NOT NULL,
  message text,
  status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'accepted'::text, 'declined'::text, 'countered'::text])),
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT offers_pkey PRIMARY KEY (id),
  CONSTRAINT offers_part_id_fkey FOREIGN KEY (part_id) REFERENCES public.parts(id),
  CONSTRAINT offers_buyer_id_fkey FOREIGN KEY (buyer_id) REFERENCES public.users(id),
  CONSTRAINT offers_seller_id_fkey FOREIGN KEY (seller_id) REFERENCES public.users(id)
);
CREATE TABLE public.disputes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  transaction_id uuid NOT NULL,
  opened_by uuid NOT NULL,
  status text NOT NULL DEFAULT 'open'::text CHECK (status = ANY (ARRAY['open'::text, 'under_review'::text, 'resolved'::text, 'closed'::text])),
  reason text NOT NULL,
  resolution text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT disputes_pkey PRIMARY KEY (id),
  CONSTRAINT disputes_transaction_id_fkey FOREIGN KEY (transaction_id) REFERENCES public.transactions(id),
  CONSTRAINT disputes_opened_by_fkey FOREIGN KEY (opened_by) REFERENCES public.users(id)
);
CREATE TABLE public.seller_reviews (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  transaction_id uuid NOT NULL UNIQUE,
  reviewer_id uuid NOT NULL,
  seller_id uuid NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT seller_reviews_pkey PRIMARY KEY (id),
  CONSTRAINT seller_reviews_transaction_id_fkey FOREIGN KEY (transaction_id) REFERENCES public.transactions(id),
  CONSTRAINT seller_reviews_reviewer_id_fkey FOREIGN KEY (reviewer_id) REFERENCES public.users(id),
  CONSTRAINT seller_reviews_seller_id_fkey FOREIGN KEY (seller_id) REFERENCES public.seller_profiles(user_id)
);
CREATE TABLE public.conversations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  part_id uuid,
  buyer_id uuid NOT NULL,
  seller_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'active'::text CHECK (status = ANY (ARRAY['active'::text, 'archived'::text])),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT conversations_pkey PRIMARY KEY (id),
  CONSTRAINT conversations_part_id_fkey FOREIGN KEY (part_id) REFERENCES public.parts(id),
  CONSTRAINT conversations_buyer_id_fkey FOREIGN KEY (buyer_id) REFERENCES public.users(id),
  CONSTRAINT conversations_seller_id_fkey FOREIGN KEY (seller_id) REFERENCES public.users(id)
);
CREATE TABLE public.messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL,
  sender_id uuid NOT NULL,
  content text NOT NULL,
  read_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT messages_pkey PRIMARY KEY (id),
  CONSTRAINT messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id),
  CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id)
);
CREATE TABLE public.search_outbox (
  id bigint NOT NULL DEFAULT nextval('search_outbox_id_seq'::regclass),
  aggregate_type text NOT NULL,
  aggregate_id uuid NOT NULL,
  event_type text NOT NULL,
  payload jsonb,
  processed boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  processed_at timestamp with time zone,
  attempts integer DEFAULT 0,
  last_error text,
  worker_id text,
  trace_id text,
  retry_count integer NOT NULL DEFAULT 0,
  CONSTRAINT search_outbox_pkey PRIMARY KEY (id)
);
CREATE TABLE public.search_events (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  query text NOT NULL,
  filters jsonb,
  result_count integer,
  session_id text,
  created_at timestamp with time zone DEFAULT now(),
  latency_ms integer,
  trace_id text,
  search_provider text,
  page integer,
  results_returned integer,
  zero_results boolean DEFAULT false,
  CONSTRAINT search_events_pkey PRIMARY KEY (id)
);
CREATE TABLE public.search_click_events (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  search_event_id uuid,
  part_id uuid,
  position integer,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT search_click_events_pkey PRIMARY KEY (id),
  CONSTRAINT search_click_events_search_event_id_fkey FOREIGN KEY (search_event_id) REFERENCES public.search_events(id),
  CONSTRAINT search_click_events_part_id_fkey FOREIGN KEY (part_id) REFERENCES public.parts(id)
);
CREATE TABLE public.search_audit_runs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  started_at timestamp with time zone NOT NULL DEFAULT now(),
  completed_at timestamp with time zone,
  missing_documents integer DEFAULT 0,
  stale_documents integer DEFAULT 0,
  duplicates integer DEFAULT 0,
  drift_percent numeric,
  CONSTRAINT search_audit_runs_pkey PRIMARY KEY (id)
);
CREATE TABLE public.search_worker_runs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  started_at timestamp with time zone NOT NULL DEFAULT now(),
  completed_at timestamp with time zone,
  documents_processed integer DEFAULT 0,
  documents_failed integer DEFAULT 0,
  retry_count integer DEFAULT 0,
  duration_ms integer,
  CONSTRAINT search_worker_runs_pkey PRIMARY KEY (id)
);
CREATE TABLE public.search_request_metrics (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  request_id text NOT NULL,
  query text,
  latency_ms integer NOT NULL,
  result_count integer,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT search_request_metrics_pkey PRIMARY KEY (id)
);
CREATE TABLE public.audit_log (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  actor_id uuid,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  before_state jsonb,
  after_state jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT audit_log_pkey PRIMARY KEY (id, created_at)
);
CREATE TABLE public.audit_log_2026_06 (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  actor_id uuid,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  before_state jsonb,
  after_state jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT audit_log_2026_06_pkey PRIMARY KEY (id, created_at)
);
CREATE TABLE public.audit_log_2026_07 (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  actor_id uuid,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  before_state jsonb,
  after_state jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT audit_log_2026_07_pkey PRIMARY KEY (id, created_at)
);
