import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Error: Variables de entorno de Supabase faltantes.');
  process.exit(1);
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
});

// Taxonomía oficial estricta para validación local previa al insert
const VALID_SYSTEMS = [
  'Climatización', 'Tren Motriz', 'Frenos', 'Suspensión', 
  'Eléctrico', 'Enfriamiento', 'Dirección', 'Carrocería', 
  'Interior', 'Vehículo Completo'
];

async function seedListingsSecure() {
  console.log('🌱 Iniciando siembra validada de inventario automotriz...');

  // 1. Obtener los vendedores reales para la relación FK
  const { data: sellers, error: sellerError } = await supabaseAdmin
    .from('seller_profiles')
    .select('user_id');

  if (sellerError || !sellers || sellers.length === 0) {
    console.error('❌ Error Relacional: No se encontraron perfiles en "seller_profiles". Ejecuta primero el seed de usuarios.');
    process.exit(1);
  }

  const sellerIds = sellers.map(s => s.user_id);
  const getSellerId = (index: number) => sellerIds[index % sellerIds.length];

  // 2. Catálogo completo con el bloque de 'Climatización' y tildes explícitas
  const mockListings = [
    {
      system: 'Climatización',
      category: 'Compresores',
      part_type: 'Compresor de Aire Acondicionado',
      brand: 'Sanden',
      model: 'Honda CR-V',
      year: 2017,
      oem_part_number: 'SND-AC-CRV17',
      is_full_vehicle: false,
      missing_parts: null,
      status: 'available',
      row_location: 'B5',
      shelf_location: '1'
    },
    {
      system: 'Tren Motriz',
      category: 'Motor',
      part_type: 'Alternador 12V',
      brand: 'Bosch',
      model: 'Ford F-150',
      year: 2018,
      oem_part_number: 'B-ALT-150-X',
      is_full_vehicle: false,
      missing_parts: null,
      status: 'available',
      row_location: 'A3',
      shelf_location: '2'
    },
    {
      system: 'Frenos',
      category: 'Cáliper',
      part_type: 'Cáliper de Freno Delantero Derecho',
      brand: 'Brembo',
      model: 'Chevrolet Silverado',
      year: 2020,
      oem_part_number: 'BRM-4412-R',
      is_full_vehicle: false,
      missing_parts: null,
      status: 'available',
      row_location: 'B1',
      shelf_location: '4'
    },
    {
      system: 'Suspensión',
      category: 'Amortiguadores',
      part_type: 'Amortiguador Hidráulico Trasero',
      brand: 'Monroe',
      model: 'Toyota Tacoma',
      year: 2019,
      oem_part_number: 'MNR-9921-T',
      is_full_vehicle: false,
      missing_parts: null,
      status: 'available',
      row_location: 'A1',
      shelf_location: '1'
    },
    {
      system: 'Eléctrico',
      category: 'Iluminación',
      part_type: 'Faro LED Principal Izquierdo',
      brand: 'Valeo',
      model: 'Jeep Wrangler',
      year: 2021,
      oem_part_number: 'VLO-LED-WR',
      is_full_vehicle: false,
      missing_parts: null,
      status: 'available',
      row_location: 'C5',
      shelf_location: '3'
    },
    {
      system: 'Tren Motriz',
      category: 'Transmisión',
      part_type: 'Transmisión Automática 6 Velocidades',
      brand: 'OEM',
      model: 'GMC Sierra',
      year: 2017,
      oem_part_number: 'GMC-6AT-XYZ',
      is_full_vehicle: false,
      missing_parts: null,
      status: 'available',
      row_location: 'D1',
      shelf_location: 'Piso'
    },
    {
      system: 'Enfriamiento',
      category: 'Radiadores',
      part_type: 'Radiador de Motor Aluminio',
      brand: 'Denso',
      model: 'Honda Civic',
      year: 2015,
      oem_part_number: 'DNS-RAD-CIV',
      is_full_vehicle: false,
      missing_parts: null,
      status: 'sold',
      row_location: 'B4',
      shelf_location: '2'
    },
    {
      system: 'Dirección',
      category: 'Cajas de Dirección',
      part_type: 'Cremallera de Dirección Asistida',
      brand: 'TRW',
      model: 'Nissan Sentra',
      year: 2018,
      oem_part_number: 'TRW-STR-SEN',
      is_full_vehicle: false,
      missing_parts: null,
      status: 'available',
      row_location: 'C2',
      shelf_location: '1'
    },
    {
      system: 'Vehículo Completo',
      category: 'Donante',
      part_type: 'Auto Completo para Desmantelar',
      brand: 'Toyota',
      model: 'Corolla',
      year: 2019,
      oem_part_number: 'VIN-TY782193821',
      is_full_vehicle: true,
      missing_parts: [],
      status: 'available',
      row_location: 'Sección Este',
      shelf_location: 'Piso'
    },
    {
      system: 'Vehículo Completo',
      category: 'Donante',
      part_type: 'Camioneta Completa',
      brand: 'Ford',
      model: 'Ranger',
      year: 2020,
      oem_part_number: 'VIN-FD992102931',
      is_full_vehicle: true,
      missing_parts: [],
      status: 'available',
      row_location: 'Sección Norte',
      shelf_location: 'Piso'
    },
    {
      system: 'Vehículo Completo',
      category: 'Donante',
      part_type: 'SUV Completa Reciclable',
      brand: 'Mazda',
      model: 'CX-5',
      year: 2018,
      oem_part_number: 'VIN-MZ449201923',
      is_full_vehicle: true,
      missing_parts: [],
      status: 'available',
      row_location: 'Sección Este',
      shelf_location: 'Piso'
    },
    {
      system: 'Vehículo Completo',
      category: 'Donante',
      part_type: 'Sedán Completo',
      brand: 'Hyundai',
      model: 'Elantra',
      year: 2021,
      oem_part_number: 'VIN-HY110293847',
      is_full_vehicle: true,
      missing_parts: [],
      status: 'available',
      row_location: 'Sección Sur',
      shelf_location: 'Piso'
    },
    {
      system: 'Vehículo Completo',
      category: 'Donante Parcial',
      part_type: 'Vehículo con Faltantes',
      brand: 'Ford',
      model: 'F-150 Lariat',
      year: 2018,
      oem_part_number: 'VIN-FD001928374',
      is_full_vehicle: true,
      missing_parts: ['Alternador', 'Faro LED Izquierdo', 'Defensa Delantera'],
      status: 'available',
      row_location: 'Sección Oeste',
      shelf_location: 'Piso'
    },
    {
      system: 'Vehículo Completo',
      category: 'Donante Parcial',
      part_type: 'Vehículo con Faltantes',
      brand: 'Chevrolet',
      model: 'Cheyenne',
      year: 2019,
      oem_part_number: 'VIN-CH883726152',
      is_full_vehicle: true,
      missing_parts: ['Transmisión Automática', 'Cáliper Delantero Derecho'],
      status: 'available',
      row_location: 'Sección Oeste',
      shelf_location: 'Piso'
    },
    {
      system: 'Vehículo Completo',
      category: 'Donante Parcial',
      part_type: 'Vehículo con Faltantes',
      brand: 'Nissan',
      model: 'March',
      year: 2017,
      oem_part_number: 'VIN-NS337281920',
      is_full_vehicle: true,
      missing_parts: ['Compresor de Aire Acondicionado', 'Estéreo Central'],
      status: 'available',
      row_location: 'Sección Sur',
      shelf_location: 'Piso'
    },
    {
      system: 'Vehículo Completo',
      category: 'Donante Parcial',
      part_type: 'Vehículo con Faltantes',
      brand: 'Volkswagen',
      model: 'Jetta',
      year: 2016,
      oem_part_number: 'VIN-VW229102938',
      is_full_vehicle: true,
      missing_parts: ['Asientos delanteros', 'Bomba de gasolina'],
      status: 'available',
      row_location: 'Sección Norte',
      shelf_location: 'Piso'
    },
    {
      system: 'Vehículo Completo',
      category: 'Donante Parcial',
      part_type: 'Vehículo con Faltantes',
      brand: 'BMW',
      model: 'Serie 3',
      year: 2015,
      oem_part_number: 'VIN-BM992019238',
      is_full_vehicle: true,
      missing_parts: ['Turbocargador', 'Intercooler', 'Rines de aleación'],
      status: 'available',
      row_location: 'Sección Este',
      shelf_location: 'Piso'
    },
    {
      system: 'Carrocería',
      category: 'Puertas',
      part_type: 'Puerta Trasera Izquierda Completa',
      brand: 'OEM',
      model: 'Nissan Frontier',
      year: 2020,
      oem_part_number: 'NIS-DOOR-RL',
      is_full_vehicle: false,
      missing_parts: null,
      status: 'available',
      row_location: 'Rack Grande 1',
      shelf_location: '1'
    },
    {
      system: 'Interior',
      category: 'Seguridad',
      part_type: 'Bolsa de Aire de Volante (Airbag)',
      brand: 'Autoliv',
      model: 'Toyota RAV4',
      year: 2019,
      oem_part_number: 'TY-AIRBAG-F1',
      is_full_vehicle: false,
      missing_parts: null,
      status: 'available',
      row_location: 'Gabinete A',
      shelf_location: '3'
    },
    {
      system: 'Tren Motriz',
      category: 'Diferenciales',
      part_type: 'Ensamble Diferencial Trasero',
      brand: 'Dana',
      model: 'Jeep Gladiator',
      year: 2020,
      oem_part_number: 'DANA-44-GLAD',
      is_full_vehicle: false,
      missing_parts: null,
      status: 'available',
      row_location: 'D3',
      shelf_location: 'Piso'
    }
  ];

  // 3. Validación de taxonomía local e inyección del seller_id relacional
  const finalListings = [];
  
  for (let i = 0; i < mockListings.length; i++) {
    const item = mockListings[i];
    
    // Verificación preventiva contra errores de tipeo en los sistemas autorizados
    if (!VALID_SYSTEMS.includes(item.system)) {
      console.error(`❌ Error de validación local: El sistema '${item.system}' no pertenece a la taxonomía permitida.`);
      process.exit(1);
    }

    finalListings.push({
      ...item,
      seller_id: getSellerId(i)
    });
  }

  // 4. Inserción masiva final
  console.log(`📤 Insertando ${finalListings.length} listings estructurados de forma segura...`);
  
  const { data, error: insertError } = await supabaseAdmin
    .from('parts_inventory')
    .insert(finalListings)
    .select();

  if (insertError) {
    console.error('❌ Error de Postgres al insertar el inventario:', insertError.message);
    process.exit(1);
  }

  console.log(`✨ Completado: Se han sembrado los ${data.length} listings. El compresor Sanden del Honda CR-V 2017 quedó activo.`);
}

seedListingsSecure().catch((err) => {
  console.error('💥 Error crítico en la ejecución:', err);
});
