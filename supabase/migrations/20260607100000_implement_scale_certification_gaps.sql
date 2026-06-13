-- S1: Add Part Condition to parts table
ALTER TABLE public.parts ADD COLUMN IF NOT EXISTS condition text
CHECK (
 condition IN (
   'new',
   'remanufactured',
   'used_excellent',
   'used_good',
   'used_fair',
   'for_parts'
 )
);

-- S3: Create materialized view for seller search signals
CREATE MATERIALIZED VIEW IF NOT EXISTS public.seller_search_signals AS
SELECT 
    sr.seller_id,
    AVG(sr.rating)::numeric(3,2) AS seller_rating_avg,
    COUNT(sr.id)::integer AS seller_review_count
FROM public.seller_reviews sr
GROUP BY sr.seller_id;

-- Create index on the materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_seller_search_signals_seller_id ON public.seller_search_signals(seller_id);

-- Optional: Refresh function for materialized view
CREATE OR REPLACE FUNCTION public.refresh_seller_search_signals()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.seller_search_signals;
END;
$$ LANGUAGE plpgsql;
