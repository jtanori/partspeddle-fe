-- Migration: automate_audit_log_id_generation_v2
-- Description: Creates a stored procedure to enforce DEFAULT gen_random_uuid() on audit log tables.

-- 1. Create the procedure to enforce the default ID constraint
CREATE OR REPLACE PROCEDURE public.fix_audit_id_default(table_name_to_fix text)
LANGUAGE plpgsql
AS $$
BEGIN
    EXECUTE format('ALTER TABLE IF EXISTS public.%I ALTER COLUMN id SET DEFAULT gen_random_uuid();', table_name_to_fix);
    RAISE NOTICE 'Applied default ID to %', table_name_to_fix;
END;
$$;

-- 2. Immediately apply to known existing tables
CALL public.fix_audit_id_default('audit_log');
CALL public.fix_audit_id_default('audit_log_2026_06');
CALL public.fix_audit_id_default('audit_log_2026_07');
