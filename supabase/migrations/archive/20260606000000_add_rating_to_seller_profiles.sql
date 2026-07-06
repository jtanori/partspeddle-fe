-- Add rating column to seller_profiles if missing
ALTER TABLE public.seller_profiles
ADD COLUMN IF NOT EXISTS rating NUMERIC(3, 2) DEFAULT 5.0;
