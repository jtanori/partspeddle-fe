-- P2.10: Retire synchronous Algolia HTTP trigger and harden SECURITY DEFINER search_path
-- search_outbox + process-search-outbox.ts is the async indexing path.

-- 1. Remove in-transaction HTTP sync (duplicates outbox worker and blocks writes)
DROP TRIGGER IF EXISTS tr_sync_part_to_algolia ON public.parts;
DROP FUNCTION IF EXISTS public.fn_sync_part_to_algolia();

-- 2. Harden outbox enqueue trigger function
CREATE OR REPLACE FUNCTION public.fn_enqueue_search_event()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.search_outbox (aggregate_type, aggregate_id, event_type, payload)
  VALUES (
    'part',
    CASE WHEN TG_OP = 'DELETE' THEN OLD.id ELSE NEW.id END,
    TG_TABLE_NAME || '_' || TG_OP,
    to_jsonb(CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END)
  );
  RETURN NULL;
END;
$$;

-- 3. Harden audit logging trigger function
CREATE OR REPLACE FUNCTION public.fn_audit_log_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_actor_id UUID;
BEGIN
  BEGIN
    v_actor_id := auth.uid();
  EXCEPTION WHEN OTHERS THEN
    v_actor_id := NULL;
  END;

  INSERT INTO public.audit_log (
    actor_id,
    action,
    entity_type,
    entity_id,
    before_state,
    after_state
  ) VALUES (
    v_actor_id,
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE to_jsonb(OLD) END,
    CASE WHEN TG_OP = 'DELETE' THEN NULL ELSE to_jsonb(NEW) END
  );

  RETURN NULL;
END;
$$;

-- 4. Harden inventory locking trigger function
CREATE OR REPLACE FUNCTION public.handle_part_sale_lock()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NEW.status = ANY (ARRAY['succeeded'::text, 'held_in_vault'::text, 'delivered'::text]) THEN
    UPDATE public.parts
    SET status = 'sold', updated_at = now()
    WHERE id = NEW.part_id;

    UPDATE public.offers
    SET status = 'declined', updated_at = now()
    WHERE part_id = NEW.part_id AND status = 'pending';
  END IF;
  RETURN NEW;
END;
$$;