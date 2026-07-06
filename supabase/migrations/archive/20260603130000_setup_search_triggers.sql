-- Parts table trigger
CREATE OR REPLACE FUNCTION public.fn_enqueue_search_event()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.search_outbox (aggregate_type, aggregate_id, event_type, payload)
  VALUES ('part', CASE WHEN TG_OP = 'DELETE' THEN OLD.id ELSE NEW.id END, TG_TABLE_NAME || '_' || TG_OP, to_jsonb(CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END));
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_parts_search_outbox ON public.parts;
CREATE TRIGGER tr_parts_search_outbox
AFTER INSERT OR UPDATE OR DELETE ON public.parts
FOR EACH ROW EXECUTE FUNCTION public.fn_enqueue_search_event();
