-- PDP Modernization Schema Migration (Phase P1.2)
-- Goal: Add missing catalog attributes to support PDP high-fidelity specs

BEGIN;

-- 1. Add missing product attributes to parts table
ALTER TABLE public.parts 
ADD COLUMN IF NOT EXISTS brand text,
ADD COLUMN IF NOT EXISTS voltage text,
ADD COLUMN IF NOT EXISTS amperage text,
ADD COLUMN IF NOT EXISTS pulley_type text,
ADD COLUMN IF NOT EXISTS rotation text,
ADD COLUMN IF NOT EXISTS warranty_months integer;

-- 2. Add seller trust & logistics attributes to seller_profiles table
ALTER TABLE public.seller_profiles
ADD COLUMN IF NOT EXISTS feedback_percentage numeric DEFAULT 0.0 CHECK (feedback_percentage >= 0 AND feedback_percentage <= 100),
ADD COLUMN IF NOT EXISTS ships_within_days integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS return_window_days integer DEFAULT 30,
ADD COLUMN IF NOT EXISTS shipping_policy text;

COMMIT;
