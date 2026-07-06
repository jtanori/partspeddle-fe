-- =========================================================================
-- MIGRACIÓN DE OPTIMIZACIÓN PARA COMPATIBILIDAD Y PRODUCCIÓN DE PARTSPEDDLE
-- =========================================================================

BEGIN;

-- 1. Restricciones de Unicidad (Esenciales para que el 'upsert' del seed funcione)
-- Nota: 'name' ya puede ser UNIQUE en algunas versiones, pero aseguramos el nombre de la restricción
ALTER TABLE public.categories 
  DROP CONSTRAINT IF EXISTS unique_category_name;
ALTER TABLE public.categories 
  ADD CONSTRAINT unique_category_name UNIQUE (name);

ALTER TABLE public.makes 
  DROP CONSTRAINT IF EXISTS unique_make_name;
ALTER TABLE public.makes 
  ADD CONSTRAINT unique_make_name UNIQUE (name);


-- 2. Índices de Rendimiento (Cruciales para las consultas masivas de Algolia y filtros)
-- Optimiza la búsqueda de modelos por marca
CREATE INDEX IF NOT EXISTS idx_models_make_id 
  ON public.models(make_id);

-- Optimiza el cruce generacional (Año-Modelo) en consultas de compatibilidad
CREATE INDEX IF NOT EXISTS idx_vehicle_variants_lookup 
  ON public.vehicle_variants(model_id, year);

-- Optimiza la carga de tipos de parte dentro de sus categorías estructuradas
CREATE INDEX IF NOT EXISTS idx_part_types_category_id 
  ON public.part_types(category_id);

-- Índice compuesto para la tabla pivote de compatibilidad (Muchos a Muchos)
-- Esto evita "Table Scans" completos cuando buscas piezas compatibles
CREATE INDEX IF NOT EXISTS idx_part_fitment_composite 
  ON public.part_fitment(part_id, vehicle_variant_id);

-- 3. Índice para el texto de búsqueda interna de Supabase (Fallbacks)
CREATE INDEX IF NOT EXISTS idx_parts_searchable_text 
  ON public.parts USING gin(to_tsvector('spanish', searchable_text));

COMMIT;
