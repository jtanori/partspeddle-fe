import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Forzar la carga de .env desde la raíz del proyecto
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Error: Variables de entorno de Supabase (VITE_SUPABASE_URL, VITE_SUPABASE_SERVICE_ROLE_KEY) faltantes.');
  process.exit(1);
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
});

async function inspectRealDatabase() {
  console.log('🔍 [DIAGNÓSTICO PARTSPEDDLE] Extrayendo catálogos actuales...\n');

  // 1. Inspeccionar Vendedores Disponibles
  console.log('=== Table: seller_profiles ===');
  const { data: sellers, error: sellerError } = await supabaseAdmin
    .from('seller_profiles')
    .select('user_id, business_name, verification_status');

  if (sellerError) {
    console.error('❌ Error en seller_profiles:', sellerError.message);
  } else if (!sellers || sellers.length === 0) {
    console.log('⚠️ No hay vendedores registrados. Recuerda correr primero el seed de usuarios.\n');
  } else {
    console.log(`✅ ${sellers.length} Vendedores listos para recibir inventario:`);
    console.table(sellers);
    console.log('\n');
  }

  // 2. Inspeccionar Categorías de Autopartes
  console.log('=== Table: categories ===');
  const { data: categories, error: catError } = await supabaseAdmin
    .from('categories')
    .select('id, name, slug');

  if (catError) {
    console.error('❌ Error en categories:', catError.message);
  } else if (!categories || categories.length === 0) {
    console.log('⚠️ Catálogo de "categories" vacío.\n');
  } else {
    console.log(`✅ ${categories.length} Categorías base encontradas:`);
    console.table(categories);
    console.log('\n');
  }

  // 3. Inspeccionar Tipos de Partes (Subcategorías)
  console.log('=== Table: part_types ===');
  const { data: partTypes, error: typeError } = await supabaseAdmin
    .from('part_types')
    .select('id, category_id, name, slug')
    .limit(10);

  if (typeError) {
    console.error('❌ Error en part_types:', typeError.message);
  } else if (!partTypes || partTypes.length === 0) {
    console.log('⚠️ Catálogo de "part_types" vacío.\n');
  } else {
    console.log(`✅ Tipos de autopartes detectados (mostrando primeros 10):`);
    console.table(partTypes);
    console.log('\n');
  }

  // 4. Inspeccionar Marcas (Makes) y Modelos (Models)
  console.log('=== Table: makes ===');
  const { data: makes, error: makeError } = await supabaseAdmin
    .from('makes')
    .select('id, name');

  if (makeError) {
    console.error('❌ Error en makes:', makeError.message);
  } else if (!makes || makes.length === 0) {
    console.log('⚠️ Catálogo de "makes" (marcas) vacío.\n');
  } else {
    console.log(`✅ ${makes.length} Marcas registradas en el sistema:`);
    console.table(makes);
    console.log('\n');
  }

  // 5. Conteo actual de inventario
  console.log('=== Table: parts (Current Inventory Count) ===');
  const { count, error: countError } = await supabaseAdmin
    .from('parts')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    console.error('❌ Error al contar inventario en "parts":', countError.message);
  } else {
    console.log(`📊 Total de listados actuales en 'parts': ${count ?? 0}\n`);
  }

  console.log('🏁 Reporte de inspección finalizado.');
}

inspectRealDatabase().catch((err) => {
  console.error('💥 Error inesperado ejecutando la inspección:', err);
});
