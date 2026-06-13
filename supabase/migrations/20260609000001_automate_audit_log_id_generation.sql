-- Migration: automate_audit_log_id_generation
-- Description: Creates an event trigger to enforce DEFAULT gen_random_uuid() on all new audit log tables.

-- 1. Create a function to enforce the default ID constraint
CREATE OR REPLACE FUNCTION public.enforce_audit_log_id_default()
RETURNS event_trigger AS $$
DECLARE
    obj record;
BEGIN
    FOR obj IN SELECT * FROM pg_event_trigger_ddl_commands()
    LOOP
        -- Check if the created object is an audit table
        IF obj.object_identity LIKE 'public.audit_log_%' THEN
            EXECUTE format('ALTER TABLE %s ALTER COLUMN id SET DEFAULT gen_random_uuid();', obj.object_identity);
            RAISE NOTICE 'Applied default ID to newly created audit table: %', obj.object_identity;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 2. Create the event trigger to fire after table creation
DROP EVENT TRIGGER IF EXISTS trg_audit_log_table_creation;
CREATE EVENT TRIGGER trg_audit_log_table_creation
ON ddl_command_end
WHEN TAG IN ('CREATE TABLE', 'CREATE TABLE AS')
EXECUTE FUNCTION public.enforce_audit_log_id_default();
