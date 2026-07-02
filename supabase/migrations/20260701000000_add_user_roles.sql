-- Canonical server-side role storage (P1.1)
-- Replaces reliance on auth.users.user_metadata.role, which clients can edit.

CREATE TABLE IF NOT EXISTS public.user_roles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('buyer', 'seller', 'admin')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.user_roles IS 'Canonical source of truth for user roles.';

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Users can always read their own role
CREATE POLICY "Users can read own role"
  ON public.user_roles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can manage all rows (via supabaseAdmin)
CREATE POLICY "Service role can manage roles"
  ON public.user_roles
  FOR ALL
  USING (false)
  WITH CHECK (false);

-- Backfill roles from existing auth user metadata
INSERT INTO public.user_roles (user_id, role)
SELECT
  id AS user_id,
  COALESCE(raw_user_meta_data ->> 'role', 'buyer') AS role
FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

-- Trigger: keep user_metadata and user_roles in sync on auth user creation.
-- This lets the client continue passing role in signup metadata while the
-- canonical table becomes the source of truth.
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
