-- Phase 4: Archival Strategy (D7)
-- Partitioning `audit_log` by RANGE (monthly)

-- 1. Create the new partitioned table structure
CREATE TABLE IF NOT EXISTS public.audit_log_partitioned (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    actor_id uuid,
    action text NOT NULL,
    entity_type text NOT NULL,
    entity_id uuid NOT NULL,
    before_state jsonb,
    after_state jsonb,
    created_at timestamp with time zone DEFAULT now()
) PARTITION BY RANGE (created_at);

-- 2. Create initial partitions for 2026
CREATE TABLE IF NOT EXISTS public.audit_log_2026_06 PARTITION OF public.audit_log_partitioned
    FOR VALUES FROM ('2026-06-01') TO ('2026-07-01');

CREATE TABLE IF NOT EXISTS public.audit_log_2026_07 PARTITION OF public.audit_log_partitioned
    FOR VALUES FROM ('2026-07-01') TO ('2026-08-01');

-- Note: The migration process to move existing data into this partitioned table
-- is a complex destructive action (renaming tables/swapping).
-- For safety, I will stop here and ask for confirmation before performing
-- the destructive swap of the live table.
