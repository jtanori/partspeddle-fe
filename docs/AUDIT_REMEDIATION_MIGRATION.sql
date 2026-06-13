-- AUDIT_REMEDIATION_MIGRATION.sql

-- 1. Apply default ID generation to the parent table
ALTER TABLE public.audit_log_partitioned 
ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- 2. Verify all existing partitions and ensure they inherit or explicitly have the default
-- Applying to existing partitions to be safe
ALTER TABLE public.audit_log_2026_06 
ALTER COLUMN id SET DEFAULT gen_random_uuid();

ALTER TABLE public.audit_log_2026_07 
ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- 3. Verification Queries (Run these to confirm)
-- Check current schema for audit_log_partitioned
-- SELECT column_name, column_default FROM information_schema.columns WHERE table_name = 'audit_log_partitioned' AND column_name = 'id';

-- Check current schema for audit_log_2026_06
-- SELECT column_name, column_default FROM information_schema.columns WHERE table_name = 'audit_log_2026_06' AND column_name = 'id';

-- 4. Rollback Plan
-- ALTER TABLE public.audit_log_partitioned ALTER COLUMN id DROP DEFAULT;
-- ALTER TABLE public.audit_log_2026_06 ALTER COLUMN id DROP DEFAULT;
-- ALTER TABLE public.audit_log_2026_07 ALTER COLUMN id DROP DEFAULT;
