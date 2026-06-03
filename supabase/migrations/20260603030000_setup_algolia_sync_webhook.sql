-- Migration: Setup Algolia Sync Webhook
-- Description: Creates a trigger to sync parts to Algolia via an Edge Function on INSERT, UPDATE, or DELETE.

-- 1. Enable pg_net extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 2. Create the sync function
CREATE OR REPLACE FUNCTION public.fn_sync_part_to_algolia()
RETURNS TRIGGER AS $$
DECLARE
  payload JSONB;
  function_url TEXT;
  service_role_key TEXT;
BEGIN
  -- NOTE: In a real Supabase environment, you would use vault or environment variables.
  -- For this migration, we assume the function is reachable at the project's functions URL.
  -- You MUST replace <PROJECT_REF> and <SERVICE_ROLE_KEY> with actual values or use a secure way to fetch them.
  
  function_url := (SELECT value FROM (SELECT current_setting('app.settings.supabase_url', true)) AS s(value)) || '/functions/v1/sync-algolia-webhook';
  -- We prefer using the service role key for internal calls between DB and Edge Functions
  -- In Supabase, this can be retrieved if configured in the DB, otherwise hardcode or use Vault.
  
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
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
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

-- NOTE: Ensure 'app.settings.supabase_url' and 'app.settings.service_role_key' are set in your Supabase DB.
-- You can set them via SQL:
-- ALTER DATABASE postgres SET "app.settings.supabase_url" = 'https://your-project.supabase.co';
-- ALTER DATABASE postgres SET "app.settings.service_role_key" = 'your-service-role-key';
