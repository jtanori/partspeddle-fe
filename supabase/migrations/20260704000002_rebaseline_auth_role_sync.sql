-- Rebaseline the auth-user role-sync trigger.
-- The default `supabase db dump` excludes the internal `auth` schema, so the
-- trigger that keeps `public.user_roles` in sync on new sign-ups is recreated
-- here. The `public.user_roles` table, policies, and `handle_new_user_role`
-- function are part of the public schema dump and are assumed to exist.

CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'buyer')
  )
  ON CONFLICT (user_id) DO UPDATE
    SET role = EXCLUDED.role,
        updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_role ON auth.users;
CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_role();
