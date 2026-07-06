-- Hardening RLS for Soft Delete (D2 & D3)
-- Update SELECT policies to filter out deleted rows

-- 1. Transactions
DROP POLICY IF EXISTS "Users can view their own transactions" ON public.transactions;
CREATE POLICY "Users can view their own transactions"
ON public.transactions
FOR SELECT
USING (((auth.uid() = buyer_id) OR (auth.uid() = seller_id)) AND deleted_at IS NULL);

-- 2. Offers
DROP POLICY IF EXISTS "Public offers are private" ON public.offers;
CREATE POLICY "Public offers are private"
ON public.offers
FOR SELECT
USING (((auth.uid() = buyer_id) OR (auth.uid() = seller_id)) AND deleted_at IS NULL);

-- 3. Conversations
DROP POLICY IF EXISTS "Users can view their own conversations" ON public.conversations;
CREATE POLICY "Users can view their own conversations"
ON public.conversations
FOR SELECT
USING (((auth.uid() = buyer_id) OR (auth.uid() = seller_id)) AND deleted_at IS NULL);

-- 4. Messages
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.messages;
CREATE POLICY "Users can view messages in their conversations"
ON public.messages
FOR SELECT
USING (EXISTS (
  SELECT 1
  FROM conversations c
  WHERE ((c.id = messages.conversation_id) AND ((c.buyer_id = auth.uid()) OR (c.seller_id = auth.uid())) AND c.deleted_at IS NULL)
) AND deleted_at IS NULL);
