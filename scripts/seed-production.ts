import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Error: Variables de entorno de Supabase faltantes.');
  process.exit(1);
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
});

// Función auxiliar para sanitizar strings y generar slugs consistentes con PostgreSQL
function generateCleanSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remueve acentos y diacríticos
    .replace(/[^a-z0-9\s-]/g, '')    // Remueve caracteres especiales remanentes
    .trim()
    .replace(/\s+/g, '-');           // Reemplaza espacios por guiones
}

const PART_SUGGESTIONS: Record<string, { partType: string; brand: string; model: string; make: string; price: number; oemPrefix: string }> = {
  'sistema-electrico': { partType: 'Alternador 12V', brand: 'Bosch', model: 'F-150', make: 'Ford', price: 3200, oemPrefix: 'B-ALT' },
  'tren-motriz': { partType: 'Transmisión Automática', brand: 'OEM', model: 'Sierra', make: 'GMC', price: 28000, oemPrefix: 'GMC-6AT' },
  'carrocera-y-colisin': { partType: 'Puerta Trasera Izquierda', brand: 'OEM', model: 'Frontier', make: 'Nissan', price: 4200, oemPrefix: 'NIS-DOOR' },
  'suspensin-y-direccin': { partType: 'Cremallera de Dirección Asistida', brand: 'TRW', model: 'Sentra', make: 'Nissan', price: 5400, oemPrefix: 'TRW-STR' },
  'sistema-elctrico-y-mdulos': { partType: 'Módulo de Control de Motor (ECM)', brand: 'Delphi', model: 'Silverado', make: 'Chevrolet', price: 8500, oemPrefix: 'ECM-CHV' },
  'climatizacin-y-enfriamiento': { partType: 'Compresor de Aire Acondicionado', brand: 'Sanden', model: 'CR-V', make: 'Honda', price: 4500, oemPrefix: 'SND-AC' },
  'sistema-de-frenos': { partType: 'Cáliper de Freno Delantero Derecho', brand: 'Brembo', model: 'Silverado', make: 'Chevrolet', price: 6800, oemPrefix: 'BRM-4412' },
  'iluminacin': { partType: 'Faro LED Principal Izquierdo', brand: 'Valeo', model: 'Wrangler', make: 'Jeep', price: 9500, oemPrefix: 'VLO-LED' },
  'interiores-y-seguridad': { partType: 'Bolsa de Aire de Volante (Airbag)', brand: 'Autoliv', model: 'RAV4', make: 'Toyota', price: 4100, oemPrefix: 'TY-AIRBAG' },
  'combustible-y-admisin': { partType: 'Cuerpo de Aceleración', brand: 'Hitachi', model: 'Altima', make: 'Nissan', price: 3100, oemPrefix: 'HIT-THR' },
  'escape-y-emisiones': { partType: 'Convertidor Catalítico', brand: 'MagnaFlow', model: 'Mustang', make: 'Ford', price: 7200, oemPrefix: 'MGF-CAT' },
  'cristales-y-espejos': { partType: 'Espejo Lateral Eléctrico Derecho', brand: 'OEM', model: 'Jetta', make: 'Volkswagen', price: 2100, oemPrefix: 'VW-MIRR' },
  'ruedas-rines-y-llantas': { partType: 'Rin de Aleación 17 Pulgadas', brand: 'BBS', model: 'Civic Si', make: 'Honda', price: 3500, oemPrefix: 'BBS-R17' },
  'audio-y-entretenimiento': { partType: 'Estéreo de Pantalla Central', brand: 'Pioneer', model: 'Sportage', make: 'Kia', price: 5800, oemPrefix: 'PIO-DISP' }
};

const DONOR_VEHICLES = [
  { make: 'Toyota', model: 'Corolla', year: 2019, brand: 'Toyota', basePrice: 45000, oem: 'VIN-TY782193' },
  { make: 'Ford', model: 'Ranger', year: 2020, brand: 'Ford', basePrice: 65000, oem: 'VIN-FD992102' },
  { make: 'Mazda', model: 'CX-5', year: 2018, brand: 'Mazda', basePrice: 58000, oem: 'VIN-MZ449201' },
  { make: 'Chevrolet', model: 'Cheyenne', year: 2019, brand: 'Chevrolet', basePrice: 72000, oem: 'VIN-CH883726' },
  { make: 'Nissan', model: 'March', year: 2017, brand: 'Nissan', basePrice: 22000, oem: 'VIN-NS337281' }
];

async function main() {
  console.log('🚀 Iniciando reparación y sincronización dinámica de listings...');

  try {
    const { data: sellers, error: sellerError } = await supabaseAdmin.from('seller_profiles').select('user_id').limit(1);
    if (sellerError || !sellers || sellers.length === 0) {
      console.error('❌ Error: Se requiere un registro en "seller_profiles".');
      process.exit(1);
    }
    const targetSellerId = sellers[0].user_id;

    const { data: dbCategories, error: fetchCatError } = await supabaseAdmin
      .from('categories')
      .select('id, name, slug');

    if (fetchCatError || !dbCategories || dbCategories.length === 0) {
      console.error('❌ Error: No se pudieron leer las categorías.');
      process.exit(1);
    }

    console.log('🧹 Limpiando registros anteriores...');
    await supabaseAdmin.from('part_fitment').delete().neq('part_id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('part_images').delete().neq('part_id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('parts').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    let totalInserted = 0;

    for (const category of dbCategories) {
      const suggest = PART_SUGGESTIONS[category.slug] || {
        partType: `Componente de ${category.name}`,
        brand: 'Generic',
        model: 'Universal',
        make: 'Genérico',
        price: 1500,
        oemPrefix: 'GEN-PART'
      };

      const year = 2015 + Math.floor(Math.random() * 9);
      const inserted = await insertProduct({
        category,
        partTypeName: suggest.partType,
        brand: suggest.brand,
        model: suggest.model,
        make: suggest.make,
        year,
        price: suggest.price,
        oem: `${suggest.oemPrefix}-${year}`,
        isFull: false,
        sellerId: targetSellerId
      });
      if (inserted) totalInserted++;
    }

    const collisionCategory = dbCategories.find(c => c.slug === 'carrocera-y-colisin') || dbCategories[0];
    
    for (let i = 0; i < DONOR_VEHICLES.length; i++) {
      const v = DONOR_VEHICLES[i];
      const isComplete = i % 2 === 0;
      const partTypeName = isComplete ? 'Vehículo Completo' : 'Vehículo con Faltantes';
      const missing = isComplete ? [] : ['Alternador', 'Faro Principal Izquierdo'];

      const inserted = await insertProduct({
        category: collisionCategory,
        partTypeName,
        brand: v.brand,
        model: v.model,
        make: v.make,
        year: v.year,
        price: isComplete ? v.basePrice : v.basePrice - 10000,
        oem: `${v.oem}-${i}`,
        isFull: true,
        missing,
        sellerId: targetSellerId
      });
      if (inserted) totalInserted++;
    }

    console.log(`🎉 Seed relacional ejecutado con éxito. Se insertaron ${totalInserted} registros.`);
  } catch (error) {
    console.error('💥 Fallo en el proceso de seed:', error);
  }
}

async function insertProduct(params: {
  category: { id: string; name: string; slug: string };
  partTypeName: string;
  brand: string;
  model: string;
  make: string;
  year: number;
  price: number;
  oem: string;
  isFull: boolean;
  missing?: string[];
  sellerId: string;
}): Promise<boolean> {
  try {
    const partTypeSlug = generateCleanSlug(params.partTypeName);
    
    let { data: dbPartType } = await supabaseAdmin
      .from('part_types')
      .select('id')
      .eq('slug', partTypeSlug)
      .single();

    if (!dbPartType) {
      const { data: newPartType } = await supabaseAdmin
        .from('part_types')
        .insert({
          category_id: params.category.id,
          name: params.partTypeName,
          slug: partTypeSlug,
          name_es: params.partTypeName,
          name_en: params.partTypeName
        })
        .select('id')
        .single();
      dbPartType = newPartType;
    }

    let { data: dbMake } = await supabaseAdmin.from('makes').select('id').eq('name', params.make).single();
    if (!dbMake) {
      const { data: newMake } = await supabaseAdmin.from('makes').insert({ name: params.make }).select('id').single();
      dbMake = newMake;
    }

    let { data: dbModel } = await supabaseAdmin.from('models').select('id').eq('name', params.model).eq('make_id', dbMake?.id).single();
    if (!dbModel) {
      const { data: newModel } = await supabaseAdmin.from('models').insert({ make_id: dbMake?.id, name: params.model }).select('id').single();
      dbModel = newModel;
    }

    let { data: dbVariant } = await supabaseAdmin.from('vehicle_variants').select('id').eq('model_id', dbModel?.id).eq('year', params.year).single();
    if (!dbVariant) {
      const { data: newVariant } = await supabaseAdmin.from('vehicle_variants').insert({ model_id: dbModel?.id, year: params.year }).select('id').single();
      dbVariant = newVariant;
    }

    const aiDataPayload = {
      detected_brand: params.brand,
      oem_number: params.oem,
      is_full_vehicle: params.isFull,
      missing_parts: params.missing || null,
      scanned_at: new Date().toISOString()
    };

    const compatibilityPayload = [{ make: params.make, model: params.model, year: params.year }];
    const partTitle = params.isFull 
      ? `${params.partTypeName} ${params.make} ${params.model} ${params.year}` 
      : `${params.partTypeName} ${params.brand} para ${params.make} ${params.model}`;

    const { data: insertedPart, error: partError } = await supabaseAdmin
      .from('parts')
      .insert({
        seller_id: params.sellerId,
        status: 'available',
        title: partTitle,
        description: `Pieza de inventario dinámico. Categoría: ${params.category.name}. OEM: ${params.oem}`,
        price_mxn: params.price,
        ai_data: aiDataPayload,
        compatibility: compatibilityPayload,
        part_type_id: dbPartType?.id,
        donor_vehicle_variant_id: params.isFull ? dbVariant?.id : null,
        searchable_text: `${partTitle} ${params.oem} ${params.brand}`.toLowerCase()
      })
      .select('id')
      .single();

    if (partError || !insertedPart) return false;

    if (!params.isFull && dbVariant) {
      await supabaseAdmin.from('part_fitment').insert({
        part_id: insertedPart.id,
        vehicle_variant_id: dbVariant.id
      });
    }

    await supabaseAdmin.from('part_images').insert({
      part_id: insertedPart.id,
      url: `https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=400`,
      is_primary: true
    });

    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
}

main();
