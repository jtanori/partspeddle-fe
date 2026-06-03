-- 0. Crear la tabla parts_inventory si no existe
CREATE TABLE IF NOT EXISTS public.parts_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    system VARCHAR(100) NOT NULL,
    category VARCHAR(100) NOT NULL,
    part_type VARCHAR(255) NOT NULL,
    brand VARCHAR(100),
    model VARCHAR(100),
    year INTEGER,
    oem_part_number VARCHAR(100),
    is_full_vehicle BOOLEAN DEFAULT FALSE,
    missing_parts JSONB,
    status VARCHAR(50) DEFAULT 'available',
    row_location VARCHAR(100),
    shelf_location VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 1. Asegurar que la restricción CHECK de 'system' acepte los valores del catálogo limpio
ALTER TABLE public.parts_inventory 
DROP CONSTRAINT IF EXISTS parts_inventory_system_check;

ALTER TABLE public.parts_inventory 
ADD CONSTRAINT parts_inventory_system_check 
CHECK (system IN (
  'Climatización', 'Tren Motriz', 'Frenos', 'Suspensión', 
  'Eléctrico', 'Enfriamiento', 'Dirección', 'Carrocería', 
  'Interior', 'Vehículo Completo'
));

-- 2. Asegurar que la restricción CHECK de 'status' esté alineada
ALTER TABLE public.parts_inventory 
DROP CONSTRAINT IF EXISTS parts_inventory_status_check;

ALTER TABLE public.parts_inventory 
ADD CONSTRAINT parts_inventory_status_check 
CHECK (status IN ('available', 'sold', 'reserved'));

-- Enable RLS
ALTER TABLE public.parts_inventory ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Allow public read access for parts_inventory" ON public.parts_inventory FOR SELECT USING (true);
