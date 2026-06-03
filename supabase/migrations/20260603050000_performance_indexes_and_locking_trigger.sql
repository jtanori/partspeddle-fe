-- Optimized Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_part_fitment_variant_id ON public.part_fitment(vehicle_variant_id);
CREATE INDEX IF NOT EXISTS idx_parts_donor_variant_id ON public.parts(donor_vehicle_variant_id);
CREATE INDEX IF NOT EXISTS idx_models_make_id ON public.models(make_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_variants_model_id ON public.vehicle_variants(model_id);
CREATE INDEX IF NOT EXISTS idx_parts_part_type_id ON public.parts(part_type_id);
CREATE INDEX IF NOT EXISTS idx_part_types_category_id ON public.part_types(category_id);

-- Atomic Inventory Locking Trigger
CREATE OR REPLACE FUNCTION public.handle_part_sale_lock()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = ANY (ARRAY['succeeded'::text, 'held_in_vault'::text, 'delivered'::text]) THEN
        UPDATE public.parts 
        SET status = 'sold', updated_at = now()
        WHERE id = NEW.part_id;

        UPDATE public.offers
        SET status = 'declined', updated_at = now()
        WHERE part_id = NEW.part_id AND status = 'pending';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_transactions_sale_lock ON public.transactions;
CREATE TRIGGER trg_transactions_sale_lock
    AFTER INSERT OR UPDATE OF status ON public.transactions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_part_sale_lock();
