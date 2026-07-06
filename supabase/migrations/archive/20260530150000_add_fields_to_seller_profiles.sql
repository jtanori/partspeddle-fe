-- Add missing fields to seller_profiles

ALTER TABLE public.seller_profiles
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS whatsapp TEXT;
