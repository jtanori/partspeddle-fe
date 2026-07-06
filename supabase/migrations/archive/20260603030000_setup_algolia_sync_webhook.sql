-- Migration: Setup Algolia Sync Webhook
-- Description: Creates a trigger to sync parts to Algolia via an Edge Function on INSERT, UPDATE, or DELETE.

-- 1. Enable extensions
CREATE EXTENSION IF NOT EXISTS pg_net;
CREATE EXTENSION IF NOT EXISTS vault;

-- 2. Create the sync function
CREATE OR REPLACE FUNCTION public.fn_sync_part_to_algolia()
RETURNS TRIGGER AS $$
DECLARE
  payload JSONB;
  function_url TEXT;
  service_role_key TEXT;
BEGIN
  -- Retrieve secrets securely from vault
  SELECT decrypted_secret INTO function_url FROM vault.decrypted_secrets WHERE name = 'SUPABASE_URL';
  SELECT decrypted_secret INTO service_role_key FROM vault.decrypted_secrets WHERE name = 'SUPABASE_SERVICE_ROLE_KEY';

  -- Construct complete function URL
  function_url := function_url || '/functions/v1/sync-algolia-webhook';

  payload := jsonb_build_object(
    'type', TG_OP,
    'table', TG_TABLE_NAME,
    'record', CASE WHEN TG_OP = 'DELETE' THEN NULL ELSE row_to_json(NEW)::jsonb END,
    'old_record', CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE row_to_json(OLD)::jsonb END
  );

  PERFORM net.http_post(
    url := function_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || service_role_key
    ),
    body := payload
  );

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create the trigger
DROP TRIGGER IF EXISTS tr_sync_part_to_algolia ON public.parts;
CREATE TRIGGER tr_sync_part_to_algolia
AFTER INSERT OR UPDATE OR DELETE ON public.parts
FOR EACH ROW EXECUTE FUNCTION public.fn_sync_part_to_algolia();
