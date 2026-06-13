-- Add scoring fields to persist search metrics
ALTER TABLE public.seller_profiles 
ADD COLUMN IF NOT EXISTS seller_trust_score integer DEFAULT 40;

ALTER TABLE public.parts 
ADD COLUMN IF NOT EXISTS listing_quality_score integer DEFAULT 0;

COMMENT ON COLUMN public.seller_profiles.seller_trust_score IS 'Calculated reputation score for search ranking (0-100)';
COMMENT ON COLUMN public.parts.listing_quality_score IS 'Calculated listing completeness/appeal score (0-100)';
