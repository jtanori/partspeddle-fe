-- Standardize Soft Delete Strategy (D2)
-- Add deleted_at to tables that are missing it
ALTER TABLE public.offers ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Create indexes for performance when filtering by deleted_at
CREATE INDEX IF NOT EXISTS idx_offers_deleted_at ON public.offers(deleted_at);
CREATE INDEX IF NOT EXISTS idx_transactions_deleted_at ON public.transactions(deleted_at);
CREATE INDEX IF NOT EXISTS idx_conversations_deleted_at ON public.conversations(deleted_at);
CREATE INDEX IF NOT EXISTS idx_messages_deleted_at ON public.messages(deleted_at);
