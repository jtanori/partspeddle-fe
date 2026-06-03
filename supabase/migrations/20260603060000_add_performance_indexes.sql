-- Performance Indexes for PartsPeddle
-- Applying indexes to optimize search, filtering, and JOIN performance on hot tables.

-- Parts Table
CREATE INDEX IF NOT EXISTS idx_parts_status ON public.parts(status);
CREATE INDEX IF NOT EXISTS idx_parts_seller ON public.parts(seller_id);
CREATE INDEX IF NOT EXISTS idx_parts_created_at ON public.parts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_parts_variant ON public.parts(donor_vehicle_variant_id);
CREATE INDEX IF NOT EXISTS idx_parts_type ON public.parts(part_type_id);

-- Offers Table
CREATE INDEX IF NOT EXISTS idx_offers_part ON public.offers(part_id);
CREATE INDEX IF NOT EXISTS idx_offers_buyer ON public.offers(buyer_id);
CREATE INDEX IF NOT EXISTS idx_offers_seller ON public.offers(seller_id);
CREATE INDEX IF NOT EXISTS idx_offers_status ON public.offers(status);

-- Transactions Table
CREATE INDEX IF NOT EXISTS idx_transactions_buyer ON public.transactions(buyer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_seller ON public.transactions(seller_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created ON public.transactions(created_at DESC);

-- Notifications Table
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON public.notifications(user_id, read) WHERE read = false;
