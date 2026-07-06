-- Enable RLS and add policies for ALL critical tables

-- --- PUBLIC READ ACCESS (Catalog) ---
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access" ON public.categories FOR SELECT USING (true);

ALTER TABLE public.part_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access" ON public.part_types FOR SELECT USING (true);

ALTER TABLE public.makes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access" ON public.makes FOR SELECT USING (true);

ALTER TABLE public.models ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access" ON public.models FOR SELECT USING (true);

ALTER TABLE public.vehicle_variants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access" ON public.vehicle_variants FOR SELECT USING (true);

ALTER TABLE public.parts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access" ON public.parts FOR SELECT USING (true);

ALTER TABLE public.part_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access" ON public.part_images FOR SELECT USING (true);

ALTER TABLE public.part_fitment ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access" ON public.part_fitment FOR SELECT USING (true);

-- --- PRIVATE DATA ACCESS (Owner-only) ---

-- 1. Users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own profile" ON public.users FOR SELECT USING (auth.uid() = id);

-- 2. Seller Profiles
ALTER TABLE public.seller_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own seller profile" ON public.seller_profiles FOR SELECT USING (auth.uid() = user_id);

-- 3. AI Scans
ALTER TABLE public.ai_scans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own ai scans" ON public.ai_scans FOR SELECT USING (auth.uid() = user_id);

-- 4. Notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);

-- 5. Risk Scores
ALTER TABLE public.risk_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own risk scores" ON public.risk_scores FOR SELECT USING (auth.uid() = user_id);

-- 6. Fraud Events
ALTER TABLE public.fraud_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own fraud events" ON public.fraud_events FOR SELECT USING (auth.uid() = user_id);

-- 7. Transactions
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own transactions" ON public.transactions FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- 8. Trust Profiles
ALTER TABLE public.trust_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own trust profile" ON public.trust_profiles FOR SELECT USING (auth.uid() = user_id);

-- 9. Transaction History
ALTER TABLE public.transaction_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own transaction history" ON public.transaction_history FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.transactions t WHERE t.id = transaction_id AND (t.buyer_id = auth.uid() OR t.seller_id = auth.uid())));

-- 10. Shipments
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own shipments" ON public.shipments FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.transactions t WHERE t.id = transaction_id AND (t.buyer_id = auth.uid() OR t.seller_id = auth.uid())));

-- 11. Events
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own events" ON public.events FOR SELECT USING (auth.uid() = user_id);
