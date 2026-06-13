-- Phase 4: Destructive Swap for audit_log partitioning
-- WARNING: This will drop the current audit_log table.

-- 1. Migrate existing data
INSERT INTO public.audit_log_partitioned (id, actor_id, action, entity_type, entity_id, before_state, after_state, created_at)
SELECT id, actor_id, action, entity_type, entity_id, before_state, after_state, created_at FROM public.audit_log;

-- 2. Drop the old table
DROP TABLE public.audit_log;

-- 3. Rename the new table
ALTER TABLE public.audit_log_partitioned RENAME TO audit_log;

-- 4. Re-apply primary key constraint if missing
ALTER TABLE public.audit_log ADD CONSTRAINT audit_log_pkey PRIMARY KEY (id, created_at);
-- Note: Partitioning requires the partition key to be part of the PK.
