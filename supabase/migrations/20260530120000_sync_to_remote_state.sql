-- Sync schema to match remote state

-- 1. Drop old tables from initial_schema
DROP TABLE IF EXISTS public.listings CASCADE;
DROP TABLE IF EXISTS public.part_types CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.sellers CASCADE;

-- 2. Create new tables in order of dependencies

-- Tables with no dependencies
CREATE TABLE public.users (
  id uuid NOT NULL,
  email text NOT NULL UNIQUE,
  full_name text,
  role text DEFAULT 'buyer'::text CHECK (role = ANY (ARRAY['buyer'::text, 'seller'::text, 'admin'::text])),
  account_status text DEFAULT 'active'::text CHECK (account_status = ANY (ARRAY['active'::text, 'suspended'::text, 'deactivated'::text])),
  avatar_url text,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT users_pkey PRIMARY KEY (id)
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

-- Tables dependent on users
CREATE TABLE public.parts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  seller_id uuid DEFAULT auth.uid(),
  status text DEFAULT 'draft'::text CHECK (status = ANY (ARRAY['draft'::text, 'available'::text, 'sold'::text, 'archived'::text])),
  title text,
  description text,
  ai_data jsonb,
  price_mxn integer,
  compatibility jsonb,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  searchable_text text,
  brand text,
  model text,
  year integer,
  CONSTRAINT parts_pkey PRIMARY KEY (id),
  CONSTRAINT parts_seller_id_fkey FOREIGN KEY (seller_id) REFERENCES public.users(id)
);

CREATE TABLE public.seller_profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE,
  business_name text NOT NULL,
  tax_country text CHECK (tax_country = ANY (ARRAY['MX'::text, 'US'::text])),
  stripe_account_id text,
  stripe_onboarding_status text DEFAULT 'not_started'::text CHECK (stripe_onboarding_status = ANY (ARRAY['not_started'::text, 'pending'::text, 'complete'::text, 'restricted'::text])),
  verification_status text DEFAULT 'pending'::text CHECK (verification_status = ANY (ARRAY['pending'::text, 'in_review'::text, 'verified'::text, 'rejected'::text, 'suspended'::text])),
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT seller_profiles_pkey PRIMARY KEY (id),
  CONSTRAINT seller_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
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

-- Tables dependent on parts/users
CREATE TABLE public.transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  buyer_id uuid,
  seller_id uuid,
  part_id uuid,
  amount_mxn integer,
  stripe_payment_intent_id text UNIQUE,
  status text,
  idempotency_key text UNIQUE,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  delivered_at timestamp without time zone,
  CONSTRAINT transactions_pkey PRIMARY KEY (id),
  CONSTRAINT transactions_seller_id_fkey FOREIGN KEY (seller_id) REFERENCES public.users(id),
  CONSTRAINT transactions_part_id_fkey FOREIGN KEY (part_id) REFERENCES public.parts(id)
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

-- Final dependencies
CREATE TABLE public.part_images (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  part_id uuid,
  url text,
  is_primary boolean DEFAULT false,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT part_images_pkey PRIMARY KEY (id),
  CONSTRAINT part_images_part_id_fkey FOREIGN KEY (part_id) REFERENCES public.parts(id)
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

CREATE TABLE public.transaction_history (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  transaction_id uuid,
  from_status text,
  to_status text,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT transaction_history_pkey PRIMARY KEY (id),
  CONSTRAINT transaction_history_transaction_id_fkey FOREIGN KEY (transaction_id) REFERENCES public.transactions(id)
);
