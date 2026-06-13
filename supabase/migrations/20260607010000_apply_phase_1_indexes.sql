-- Phase 1: Database Indexing Strategy (D1)

-- Parts Table
CREATE INDEX IF NOT EXISTS idx_parts_status ON parts(status);
CREATE INDEX IF NOT EXISTS idx_parts_seller ON parts(seller_id);
CREATE INDEX IF NOT EXISTS idx_parts_created ON parts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_parts_part_type ON parts(part_type_id);
CREATE INDEX IF NOT EXISTS idx_parts_variant ON parts(donor_vehicle_variant_id);

-- Search Outbox
CREATE INDEX IF NOT EXISTS idx_search_outbox_unprocessed ON search_outbox(processed, created_at);
CREATE INDEX IF NOT EXISTS idx_search_outbox_retry ON search_outbox(retry_count, processed);

-- Transactions
CREATE INDEX IF NOT EXISTS idx_transactions_buyer ON transactions(buyer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_seller ON transactions(seller_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);

-- Offers
CREATE INDEX IF NOT EXISTS idx_offers_part ON offers(part_id);
CREATE INDEX IF NOT EXISTS idx_offers_buyer ON offers(buyer_id);
CREATE INDEX IF NOT EXISTS idx_offers_seller ON offers(seller_id);

-- Conversations
CREATE INDEX IF NOT EXISTS idx_conversations_buyer ON conversations(buyer_id);
CREATE INDEX IF NOT EXISTS idx_conversations_seller ON conversations(seller_id);

-- Messages
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at);
