-- Migración de Producción: Taxonomía y Catálogo Vehicular Base para PartsPeddle
-- Categorías, Tipos de Partes, Marcas y Modelos (Años 2012 - 2026)

BEGIN;

-- =========================================================================
-- 1. CONFIGURACIÓN DE RESTRICCIONES ÚNICAS
-- =========================================================================
ALTER TABLE public.categories 
  DROP CONSTRAINT IF EXISTS categories_name_unique,
  ADD CONSTRAINT categories_name_unique UNIQUE (name);

ALTER TABLE public.part_types 
  DROP CONSTRAINT IF EXISTS part_types_category_id_name_unique,
  ADD CONSTRAINT part_types_category_id_name_unique UNIQUE (category_id, name);

ALTER TABLE public.models
  DROP CONSTRAINT IF EXISTS models_make_id_name_unique,
  ADD CONSTRAINT models_make_id_name_unique UNIQUE (make_id, name);

ALTER TABLE public.vehicle_variants
  DROP CONSTRAINT IF EXISTS vehicle_variants_model_id_year_unique,
  ADD CONSTRAINT vehicle_variants_model_id_year_unique UNIQUE (model_id, year);


-- =========================================================================
-- 2. INYECCIÓN MASIVA DE TAXONOMÍA (13 CATEGORÍAS - 120+ COMPONENTES)
-- =========================================================================
DO $$
DECLARE
    cat_record JSONB;
    type_record JSONB;
    v_category_id UUID;
    
    -- Payload de la Ultra Taxonomía en formato JSONB nativo
    taxonomy_json JSONB := '[
      {"es": "Tren Motriz", "en": "Drivetrain", "icon": "engine", "types": [
        {"es": "Motor Completo", "en": "Complete Engine"}, {"es": "Transmisión Automática", "en": "Automatic Transmission"}, {"es": "Transmisión Manual", "en": "Manual Transmission"}, {"es": "Diferencial Trasero", "en": "Rear Differential"}, {"es": "Diferencial Delantero", "en": "Front Differential"}, {"es": "Flecha de Tracción / Cardán", "en": "Drive Shaft"}, {"es": "Convertidor de Torque", "en": "Torque Converter"}, {"es": "Caja de Transferencia (4x4)", "en": "Transfer Case"}, {"es": "Flecha Homocinética / Semieje", "en": "CV Axle Shaft"}, {"es": "Soporte de Motor / Transmisión", "en": "Engine / Transmission Mount"}, {"es": "Cabeza de Motor / Culata", "en": "Cylinder Head"}, {"es": "Cigüeñal", "en": "Crankshaft"}, {"es": "Cárter de Aceite", "en": "Oil Pan"}, {"es": "Volante Motriz / Crema", "en": "Flywheel"}
      ]},
      {"es": "Carrocería y Colisión", "en": "Body & Collision", "icon": "car-door", "types": [
        {"es": "Fascia Delantera", "en": "Front Bumper"}, {"es": "Fascia Trasera", "en": "Rear Bumper"}, {"es": "Cofre", "en": "Hood"}, {"es": "Puerta Delantera Izquierda", "en": "Front Left Door"}, {"es": "Puerta Delantera Derecha", "en": "Front Right Door"}, {"es": "Puerta Trasera Izquierda", "en": "Rear Left Door"}, {"es": "Puerta Trasera Derecha", "en": "Rear Right Door"}, {"es": "Salpicadera Izquierda", "en": "Left Fender"}, {"es": "Salpicadera Derecha", "en": "Right Fender"}, {"es": "Tapa de Caja Pickup", "en": "Tailgate"}, {"es": "Quinta Puerta / Cajuela", "en": "Trunk Lid / Hatch"}, {"es": "Parrilla Delantera", "en": "Front Grille"}, {"es": "Alma de Fascia Delantera", "en": "Front Bumper Reinforcement"}, {"es": "Marco Radiador / Soporte Central", "en": "Radiator Support"}, {"es": "Costado / Quarter Panel", "en": "Quarter Panel"}, {"es": "Toldo / Techo Estructural", "en": "Roof Assembly"}, {"es": "Quemacocos / Sunroof Completo", "en": "Sunroof Assembly"}, {"es": "Tolva de Salpicadera", "en": "Fender Liner"}
      ]},
      {"es": "Suspensión y Dirección", "en": "Suspension & Steering", "icon": "wrench", "types": [
        {"es": "Amortiguador Delantero", "en": "Front Shock Absorber"}, {"es": "Amortiguador Trasero", "en": "Rear Shock Absorber"}, {"es": "Cremallera de Dirección Asistida", "en": "Power Steering Rack"}, {"es": "Horquilla de Suspensión Superior", "en": "Upper Control Arm"}, {"es": "Horquilla de Suspensión Inferior", "en": "Lower Control Arm"}, {"es": "Muelle de Hojas Trasero", "en": "Leaf Spring"}, {"es": "Bomba de Dirección Hidráulica", "en": "Power Steering Pump"}, {"es": "Mango de Suspensión / Muñón", "en": "Steering Knuckle"}, {"es": "Barra Estabilizadora", "en": "Sway Bar"}, {"es": "Columna de Dirección Eléctrica", "en": "Electric Steering Column"}, {"es": "Terminal de Dirección", "en": "Tie Rod End"}, {"es": "Resorte Helicoidal", "en": "Coil Spring"}, {"es": "Puente de Suspensión / Subframe", "en": "Suspension Subframe"}
      ]},
      {"es": "Sistema Eléctrico y Módulos", "en": "Electrical & Modules", "icon": "flash", "types": [
        {"es": "Computadora de Motor ECM", "en": "Engine Control Module ECM"}, {"es": "Alternador", "en": "Alternator"}, {"es": "Marcha / Motor de Arranque", "en": "Starter Motor"}, {"es": "Módulo de Frenos ABS", "en": "ABS Control Module"}, {"es": "Tablero de Instrumentos / Cluster", "en": "Instrument Cluster"}, {"es": "Caja de Fusibles / TIPM", "en": "Fuse Box / TIPM"}, {"es": "Módulo de Carrocería BCM", "en": "Body Control Module BCM"}, {"es": "Módulo de Transmisión TCM", "en": "Transmission Control Module TCM"}, {"es": "Arnés Eléctrico de Motor", "en": "Engine Wiring Harness"}, {"es": "Módulo de Airbags / Impacto", "en": "Airbag Control Module"}, {"es": "Distribuidor de Encendido", "en": "Ignition Distributor"}, {"es": "Bobina de Encendido", "en": "Ignition Coil"}
      ]},
      {"es": "Climatización y Enfriamiento", "en": "HVAC & Cooling", "icon": "snowflake", "types": [
        {"es": "Compresor de Aire Acondicionado", "en": "A/C Compressor"}, {"es": "Condensador de A/C", "en": "A/C Condenser"}, {"es": "Radiador de Motor", "en": "Engine Radiator"}, {"es": "Intercooler", "en": "Intercooler"}, {"es": "Motoventilador", "en": "Radiator Fan Assembly"}, {"es": "Bomba de Agua", "en": "Water Pump"}, {"es": "Núcleo de Calefacción", "en": "Heater Core"}, {"es": "Depósito de Anticongelante", "en": "Coolant Reservoir"}, {"es": "Motor Soplador de A/C / Blower", "en": "A/C Blower Motor"}, {"es": "Toma de Agua / Termostato", "en": "Thermostat Housing"}
      ]},
      {"es": "Sistema de Frenos", "en": "Brake System", "icon": "disc-brake", "types": [
        {"es": "Cáliper de Freno Delantero", "en": "Front Brake Caliper"}, {"es": "Cáliper de Freno Trasero", "en": "Rear Brake Caliper"}, {"es": "Bomba de Freno / Cilindro Maestro", "en": "Brake Master Cylinder"}, {"es": "Booster de Freno", "en": "Brake Booster"}, {"es": "Disco de Freno", "en": "Brake Rotor"}, {"es": "Bomba Actuadora ABS", "en": "ABS Pump Assembly"}, {"es": "Palanca / Cable de Freno de Mano", "en": "Parking Brake Lever/Cable"}
      ]},
      {"es": "Iluminación", "en": "Lighting", "icon": "lightbulb", "types": [
        {"es": "Faro Delantero Izquierdo", "en": "Left Headlight Assembly"}, {"es": "Faro Delantero Derecho", "en": "Right Headlight Assembly"}, {"es": "Calavera Trasera Izquierda", "en": "Left Tail Light"}, {"es": "Calavera Trasera Derecha", "en": "Right Tail Light"}, {"es": "Faro de Niebla", "en": "Fog Light"}, {"es": "Tercera Luz de Freno", "en": "Third Brake Light"}, {"es": "Cuarto Lateral / Reflejante", "en": "Side Marker Light"}
      ]},
      {"es": "Interiores y Seguridad", "en": "Interior & Safety", "icon": "seat", "types": [
        {"es": "Asiento Delantero", "en": "Front Seat"}, {"es": "Asiento Trasero", "en": "Rear Seat"}, {"es": "Bolsa de Aire / Airbag (Volante)", "en": "Driver Airbag"}, {"es": "Bolsa de Aire (Tablero)", "en": "Passenger Airbag"}, {"es": "Volante de Dirección", "en": "Steering Wheel"}, {"es": "Cinturón de Seguridad", "en": "Seat Belt"}, {"es": "Consola Central", "en": "Center Console"}, {"es": "Visera Solar", "en": "Sun Visor"}, {"es": "Tapa de Puerta Interior", "en": "Door Panel Interior"}, {"es": "Tablero Desnudo / Dash Pad", "en": "Dashboard Pad"}
      ]},
      {"es": "Combustible y Admisión", "en": "Fuel & Intake Systems", "icon": "gas-pump", "types": [
        {"es": "Inyector de Combustible", "en": "Fuel Injector"}, {"es": "Bomba de Gasolina / Diésel", "en": "Fuel Pump Assembly"}, {"es": "Cuerpo de Aceleración", "en": "Throttle Body"}, {"es": "Tanque de Combustible", "en": "Fuel Tank"}, {"es": "Riel de Inyectores", "en": "Fuel Rail"}, {"es": "Múltiple de Admisión", "en": "Intake Manifold"}, {"es": "Caja de Filtro de Aire", "en": "Air Cleaner Box"}, {"es": "Bomba de Inyección Diésel", "en": "Diesel Injection Pump"}
      ]},
      {"es": "Escape y Emisiones", "en": "Exhaust & Emissions", "icon": "wind", "types": [
        {"es": "Múltiple de Escape", "en": "Exhaust Manifold"}, {"es": "Catalizador", "en": "Catalytic Converter"}, {"es": "Silenciador / Mofle", "en": "Exhaust Muffler"}, {"es": "Sensor de Oxígeno", "en": "Oxygen Sensor"}, {"es": "Válvula EGR", "en": "EGR Valve"}, {"es": "Filtro de Partículas Diésel DPF", "en": "DPF Filter"}
      ]},
      {"es": "Cristales y Espejos", "en": "Glass & Mirrors", "icon": "windows", "types": [
        {"es": "Parabrisas Delantero", "en": "Windshield"}, {"es": "Cristal de Puerta", "en": "Door Glass"}, {"es": "Medallón Trasero", "en": "Rear Window Glass"}, {"es": "Espejo Lateral Eléctrico", "en": "Power Side Mirror"}, {"es": "Espejo Retrovisor Interno", "en": "Interior Rear View Mirror"}, {"es": "Motor de Elevador de Cristal", "en": "Window Regulator Motor"}, {"es": "Mecanismo Elevador de Cristal", "en": "Window Regulator"}
      ]},
      {"es": "Ruedas, Rines y Llantas", "en": "Wheels & Tires", "icon": "disc", "types": [
        {"es": "Rin de Aluminio / Aleación", "en": "Aluminum / Alloy Wheel"}, {"es": "Rin de Acero / Placaacero", "en": "Steel Wheel"}, {"es": "Llanta de Refacción / Dona", "en": "Spare Tire"}, {"es": "Sensor de Presión TPMS", "en": "TPMS Sensor"}, {"es": "Tapón de Rin / Copa", "en": "Wheel Hub Cap"}
      ]},
      {"es": "Audio y Entretenimiento", "en": "Audio & Infotainment", "icon": "radio", "types": [
        {"es": "Estéreo / Radio / Pantalla OEM", "en": "Factory Radio / Display Screen"}, {"es": "Amplificador de Audio", "en": "Audio Amplifier"}, {"es": "Bocina / Altavoz", "en": "Audio Speaker"}, {"es": "Cámara de Reversa OEM", "en": "Backup Camera"}, {"es": "Módulo de Navegación / GPS", "en": "GPS Navigation Module"}
      ]}
    ]';
BEGIN
    FOR cat_record IN SELECT * FROM jsonb_array_elements(taxonomy_json) LOOP
        INSERT INTO public.categories (name, name_es, name_en, slug, slug_es, slug_en, icon)
        VALUES (
            cat_record->>'es',
            cat_record->>'es',
            cat_record->>'en',
            lower(regexp_replace(cat_record->>'es', '[^a-zA-Z0-9]+', '-', 'g')),
            lower(regexp_replace(cat_record->>'es', '[^a-zA-Z0-9]+', '-', 'g')),
            lower(regexp_replace(cat_record->>'en', '[^a-zA-Z0-9]+', '-', 'g')),
            cat_record->>'icon'
        )
        ON CONFLICT (name) DO UPDATE SET
            name_es = EXCLUDED.name_es,
            name_en = EXCLUDED.name_en,
            icon = EXCLUDED.icon
        RETURNING id INTO v_category_id;

        FOR type_record IN SELECT * FROM jsonb_array_elements(cat_record->'types') LOOP
            INSERT INTO public.part_types (category_id, name, name_es, name_en, slug, slug_es, slug_en)
            VALUES (
                v_category_id,
                type_record->>'es',
                type_record->>'es',
                type_record->>'en',
                lower(regexp_replace(type_record->>'es', '[^a-zA-Z0-9]+', '-', 'g')),
                lower(regexp_replace(type_record->>'es', '[^a-zA-Z0-9]+', '-', 'g')),
                lower(regexp_replace(type_record->>'en', '[^a-zA-Z0-9]+', '-', 'g'))
            )
            ON CONFLICT (category_id, name) DO UPDATE SET
                name_es = EXCLUDED.name_es,
                name_en = EXCLUDED.name_en;
        END LOOP;
    END LOOP;
END $$;


-- =========================================================================
-- 3. INYECCIÓN MASIVA DEL PARQUE VEHICULAR MEX/US (25 MARCAS - 130+ MODELOS)
-- =========================================================================
DO $$
DECLARE
    brand_record JSONB;
    model_name TEXT;
    v_make_id UUID;
    v_model_id UUID;
    v_year INT;
    
    -- Catálogo vehicular consolidado
    vehicles_json JSONB := '[
      {"make": "Toyota", "models": ["Tacoma", "Hilux", "Rav4", "Corolla", "Tundra", "Sienna", "Camry", "Yaris", "Prius", "Avanza", "Highlander"]},
      {"make": "Nissan", "models": ["Versa", "Sentra", "March", "Frontier", "NP300", "Altima", "Kicks", "X-Trail", "Pathfinder", "Tsuru", "Tiida", "Urvan"]},
      {"make": "Ford", "models": ["F-150", "Ranger", "Mustang", "Explorer", "Edge", "Super Duty", "Focus", "Fiesta", "Escape", "Fusion", "EcoSport", "Bronco", "Transit"]},
      {"make": "Chevrolet", "models": ["Silverado", "Cheyenne", "Aveo", "Colorado", "Tahoe", "Suburban", "Spark", "Trax", "Equinox", "Cruze", "Onix", "Captiva", "S10", "Tornado"]},
      {"make": "Honda", "models": ["Civic", "CR-V", "Accord", "HR-V", "Pilot", "Odyssey", "Fit", "City", "BR-V", "Insight"]},
      {"make": "Jeep", "models": ["Wrangler", "Grand Cherokee", "Cherokee", "Gladiator", "Compass", "Liberty", "Renegade", "Patriot"]},
      {"make": "Ram", "models": ["1500", "2500", "700", "Promaster", "4000", "Heavy Duty"]},
      {"make": "GMC", "models": ["Sierra", "Acadia", "Yukon", "Canyon", "Terrain", "Envoy"]},
      {"make": "Mazda", "models": ["Mazda 3", "CX-5", "CX-30", "Mazda 6", "Mazda 2", "CX-9", "MX-5", "CX-3"]},
      {"make": "Volkswagen", "models": ["Jetta", "Golf", "Tiguan", "Vento", "Taos", "Polo", "Passat", "Beetle", "Virtus", "Saveiro", "Amarok", "Crafter", "GTI"]},
      {"make": "Hyundai", "models": ["Accent", "Elantra", "Tucson", "Santa Fe", "Grand i10", "Creta", "Sonata", "Ioniq"]},
      {"make": "Kia", "models": ["Rio", "Forte", "Sportage", "Sorento", "Soul", "Optima", "Seltos", "Niro", "Stinger"]},
      {"make": "Dodge", "models": ["Charger", "Challenger", "Durango", "Neon", "Attitude", "Journey", "Dart", "Ram Van"]},
      {"make": "Chrysler", "models": ["Town & Country", "300", "Pacifica", "Voyager"]},
      {"make": "BMW", "models": ["Series 3", "Series 5", "X3", "X5", "Series 1", "X1", "M3", "M5"]},
      {"make": "Mercedes-Benz", "models": ["C-Class", "E-Class", "GLC", "GLE", "Sprinter", "A-Class", "CLA", "S-Class"]},
      {"make": "Audi", "models": ["A3", "A4", "A6", "Q3", "Q5", "Q7", "A1", "S3"]},
      {"make": "Lexus", "models": ["RX", "ES", "IS", "GX", "NX", "UX"]},
      {"make": "Mitsubishi", "models": ["L200", "Outlander", "Mirage", "Montero", "Eclipse Cross", "Lancer"]},
      {"make": "Suzuki", "models": ["Swift", "Vitara", "Jimny", "Ertiga", "Ignis", "S-Cross"]},
      {"make": "Subaru", "models": ["Impreza", "Outback", "Forester", "WRX", "XV / Crosstrek"]},
      {"make": "Acura", "models": ["MDX", "RDX", "ILX", "TLX"]},
      {"make": "Infiniti", "models": ["Q50", "QX60", "QX80", "Q60"]},
      {"make": "Volvo", "models": ["XC60", "XC90", "XC40", "S60"]},
      {"make": "Peugeot", "models": ["208", "3008", "2008", "Partner", "Manager"]}
    ]';
BEGIN
    FOR brand_record IN SELECT * FROM jsonb_array_elements(vehicles_json) LOOP
        INSERT INTO public.makes (name)
        VALUES (brand_record->>'make')
        ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
        RETURNING id INTO v_make_id;

        FOR model_name IN SELECT jsonb_array_elements_text(brand_record->'models') LOOP
            INSERT INTO public.models (make_id, name)
            VALUES (v_make_id, model_name)
            ON CONFLICT (make_id, name) DO UPDATE SET name = EXCLUDED.name
            RETURNING id INTO v_model_id;

            -- Inyección en lote de la matriz generacional [2012 a 2026]
            FOR v_year IN 2012..2026 LOOP
                INSERT INTO public.vehicle_variants (model_id, year)
                VALUES (v_model_id, v_year)
                ON CONFLICT (model_id, year) DO NOTHING;
            END LOOP;
        END LOOP;
    END LOOP;
END $$;

COMMIT;
