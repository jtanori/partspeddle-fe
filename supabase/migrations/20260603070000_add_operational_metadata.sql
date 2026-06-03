-- 1. Agregar soft-delete a las tablas críticas
ALTER TABLE public.parts ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.seller_profiles ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- 2. Extender el check constraint de status en parts
-- Primero eliminamos la restricción existente si existe
ALTER TABLE public.parts DROP CONSTRAINT IF EXISTS parts_status_check;
ALTER TABLE public.parts ADD CONSTRAINT parts_status_check 
  CHECK (status IN ('draft', 'pending_review', 'available', 'reserved', 'sold', 'removed', 'archived'));
