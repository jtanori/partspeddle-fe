-- Phase 3: Review Integrity Validation (D5)
-- Ensure that each transaction can only have one review.

-- 1. Check for existing duplicate reviews and warn (manual cleanup may be needed)
-- 2. Add UNIQUE constraint to transaction_id

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'seller_reviews_transaction_id_key'
    ) THEN
        ALTER TABLE public.seller_reviews ADD CONSTRAINT seller_reviews_transaction_id_key UNIQUE (transaction_id);
    END IF;
END $$;
