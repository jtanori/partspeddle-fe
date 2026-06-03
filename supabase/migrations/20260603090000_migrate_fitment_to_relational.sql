-- 1. Migrar datos JSONB a la tabla part_fitment
INSERT INTO public.part_fitment (part_id, vehicle_variant_id)
SELECT 
    p.id as part_id,
    vv.id as vehicle_variant_id
FROM public.parts p
CROSS JOIN LATERAL jsonb_to_recordset(p.compatibility) AS comp(make TEXT, model TEXT, year INT)
JOIN public.makes m ON m.name = comp.make
JOIN public.models mo ON mo.make_id = m.id AND mo.name = comp.model
JOIN public.vehicle_variants vv ON vv.model_id = mo.id AND vv.year = comp.year
ON CONFLICT DO NOTHING;

-- 2. Eliminar la columna JSONB redundante tras verificar que los datos fueron migrados
ALTER TABLE public.parts DROP COLUMN IF EXISTS compatibility;
