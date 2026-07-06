-- Phase 3: Transaction Integrity Validation (D4)
-- Enforce that the seller in the transaction matches the seller of the part.

CREATE OR REPLACE FUNCTION public.validate_transaction_seller()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS trg_validate_transaction_seller ON public.transactions;
CREATE TRIGGER trg_validate_transaction_seller
BEFORE INSERT OR UPDATE ON public.transactions
FOR EACH ROW EXECUTE FUNCTION public.validate_transaction_seller();
