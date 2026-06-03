BEGIN;

-- =========================================================================
-- 1. CORRECCIÓN DE LA TAXONOMÍA Y VEHÍCULO DONANTE EN PARTS
-- =========================================================================

-- Remover los campos de texto plano que ensucian la base de datos
ALTER TABLE public.parts DROP COLUMN IF EXISTS brand;
ALTER TABLE public.parts DROP COLUMN IF EXISTS model;
ALTER TABLE public.parts DROP COLUMN IF EXISTS year;

-- Agregar las relaciones limpias y estructuradas
-- Usamos IF NOT EXISTS para mayor seguridad en la ejecución
ALTER TABLE public.parts 
  ADD COLUMN IF NOT EXISTS part_type_id uuid,
  ADD COLUMN IF NOT EXISTS donor_vehicle_variant_id uuid;

-- Configurar las Llaves Foráneas (FK) con borrado seguro
ALTER TABLE public.parts DROP CONSTRAINT IF EXISTS parts_part_type_id_fkey;
ALTER TABLE public.parts
  ADD CONSTRAINT parts_part_type_id_fkey 
    FOREIGN KEY (part_type_id) REFERENCES public.part_types(id) ON DELETE SET NULL;

ALTER TABLE public.parts DROP CONSTRAINT IF EXISTS parts_donor_vehicle_variant_id_fkey;
ALTER TABLE public.parts
  ADD CONSTRAINT parts_donor_vehicle_variant_id_fkey 
    FOREIGN KEY (donor_vehicle_variant_id) REFERENCES public.vehicle_variants(id) ON DELETE SET NULL;


-- =========================================================================
-- 2. BLINDAJE TRANSACCIONAL Y CASCADAS
-- =========================================================================

-- Agregar restricción CHECK a las transacciones para asegurar consistencia con Stripe
ALTER TABLE public.transactions DROP CONSTRAINT IF EXISTS transactions_status_check;
ALTER TABLE public.transactions 
  ADD CONSTRAINT transactions_status_check 
  CHECK (status = ANY (ARRAY['pending'::text, 'requires_capture'::text, 'succeeded'::text, 'failed'::text, 'refunded'::text]));

-- Reconfigurar las imágenes para que se borren automáticamente si el listing se elimina
ALTER TABLE public.part_images DROP CONSTRAINT IF EXISTS part_images_part_id_fkey;
ALTER TABLE public.part_images
  ADD CONSTRAINT part_images_part_id_fkey 
    FOREIGN KEY (part_id) REFERENCES public.parts(id) ON DELETE CASCADE;

-- Reconfigurar la tabla pivote de compatibilidad con borrado en cascada dual
ALTER TABLE public.part_fitment 
  DROP CONSTRAINT IF EXISTS part_fitment_part_id_fkey,
  DROP CONSTRAINT IF EXISTS part_fitment_vehicle_variant_id_fkey;

ALTER TABLE public.part_fitment
  ADD CONSTRAINT part_fitment_part_id_fkey 
    FOREIGN KEY (part_id) REFERENCES public.parts(id) ON DELETE CASCADE,
  ADD CONSTRAINT part_fitment_vehicle_variant_id_fkey 
    FOREIGN KEY (vehicle_variant_id) REFERENCES public.vehicle_variants(id) ON DELETE CASCADE;


-- =========================================================================
-- 3. ÍNDICES DE RENDIMIENTO PARA PRODUCCIÓN
-- =========================================================================
CREATE INDEX IF NOT EXISTS idx_parts_part_type_id ON public.parts(part_type_id);
CREATE INDEX IF NOT EXISTS idx_parts_donor_variant ON public.parts(donor_vehicle_variant_id);

COMMIT;
