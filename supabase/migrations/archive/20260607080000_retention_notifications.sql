-- Phase 4: Retention Policy for Notifications (D6)
-- Implement cleanup of notifications older than 180 days

CREATE OR REPLACE FUNCTION public.cleanup_old_notifications()
RETURNS void AS $$
BEGIN
    DELETE FROM public.notifications
    WHERE created_at < NOW() - INTERVAL '180 days';
END;
$$ LANGUAGE plpgsql;

-- We can schedule this to run via pg_cron if available, 
-- or it can be manually called/integrated into a broader maintenance task.
-- For now, this establishes the retention logic.
