-- 1. Función genérica de auditoría
CREATE OR REPLACE FUNCTION public.fn_audit_log_changes()
RETURNS TRIGGER AS $$
DECLARE
    v_actor_id UUID;
BEGIN
    -- Intentar obtener el ID del usuario desde auth.uid()
    BEGIN
        v_actor_id := auth.uid();
    EXCEPTION WHEN OTHERS THEN
        v_actor_id := NULL;
    END;

    -- Registrar el cambio
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Aplicar el trigger a tablas críticas
DROP TRIGGER IF EXISTS trg_audit_parts ON public.parts;
CREATE TRIGGER trg_audit_parts AFTER INSERT OR UPDATE OR DELETE ON public.parts
FOR EACH ROW EXECUTE FUNCTION public.fn_audit_log_changes();

DROP TRIGGER IF EXISTS trg_audit_transactions ON public.transactions;
CREATE TRIGGER trg_audit_transactions AFTER INSERT OR UPDATE OR DELETE ON public.transactions
FOR EACH ROW EXECUTE FUNCTION public.fn_audit_log_changes();

DROP TRIGGER IF EXISTS trg_audit_offers ON public.offers;
CREATE TRIGGER trg_audit_offers AFTER INSERT OR UPDATE OR DELETE ON public.offers
FOR EACH ROW EXECUTE FUNCTION public.fn_audit_log_changes();

DROP TRIGGER IF EXISTS trg_audit_seller_profiles ON public.seller_profiles;
CREATE TRIGGER trg_audit_seller_profiles AFTER INSERT OR UPDATE OR DELETE ON public.seller_profiles
FOR EACH ROW EXECUTE FUNCTION public.fn_audit_log_changes();
