import { createClient } from '@supabase/supabase-js';
import { algoliasearch } from 'algoliasearch';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Forzar la carga de .env desde la raíz del proyecto
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY!
);

const algoliaClient = algoliasearch(
  process.env.VITE_ALGOLIA_APP_ID!,
  process.env.VITE_ALGOLIA_ADMIN_API_KEY!
);

async function syncSupabaseToAlgolia() {
  console.log('🔄 Iniciando extracción de Supabase para indexación en Algolia...');

  try {
    // 1. Consultar listados activos (Query 100% limpio sin comentarios internos)
    const { data: parts, error } = await supabase
      .from('parts')
      .select(`
        id,
        title,
        description,
        price_mxn,
        status,
        created_at,
        part_types (
          name,
          categories (
            name
          )
        ),
        donor_vehicle:vehicle_variants!parts_donor_vehicle_variant_id_fkey (
          year,
          models (
            name,
            makes (name)
          )
        ),
        part_images (
          url
        )
      `)
      .eq('status', 'available')
      .not('part_type_id', 'is', null);

    if (error) throw error;

    if (!parts || parts.length === 0) {
      console.log('⚠️ No se encontraron listings relacionales listos para sincronizar.');
      return;
    }

    console.log(`📦 Procesando y transformando ${parts.length} listings...`);

    // 2. Mapear al payload denormalizado de Algolia usando el alias limpio
    const algoliaRecords = parts.map((part: any) => {
      const donorMake = part.donor_vehicle?.models?.makes?.name || 'Universal';
      return {
        objectID: part.id,
        title: part.title,
        description: part.description,
        brand: donorMake, // Usamos la marca del vehículo donante como marca de la pieza
        price_mxn: part.price_mxn,
        status: part.status,
        condition: 'used', // Valor por defecto ya que la columna no existe en parts
        created_at: Math.floor(new Date(part.created_at).getTime() / 1000),
        image_url: part.part_images?.[0]?.url || null,
        part_type: part.part_types?.name || 'Otros',
        category: part.part_types?.categories?.name || 'Sin Categoría',
        donor_vehicle: {
          make: donorMake,
          model: part.donor_vehicle?.models?.name || 'N/A',
          year: part.donor_vehicle?.year || null
        }
      };
    });

    // 3. Guardar masivamente en Algolia
    console.log('📤 Subiendo registros a Algolia...');
    const { taskID } = await algoliaClient.saveObjects({ 
      indexName: 'parts_inventory', 
      objects: algoliaRecords 
    });
    
    console.log(`🎉 Sincronización exitosa. Task ID: ${taskID}`);

  } catch (error) {
    console.error('❌ Error crítico en el pipeline de sincronización:', error);
  }
}

syncSupabaseToAlgolia();
