import { algoliasearch } from 'algoliasearch';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Forzar la carga de .env desde la raíz del proyecto
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const client = algoliasearch(
  process.env.VITE_ALGOLIA_APP_ID!,
  process.env.VITE_ALGOLIA_ADMIN_API_KEY!
);

// IMPORTANTE: Asegurar que coincida con el ALGOLIA_INDEX_NAME de tu Edge Function
const INDEX_NAME = 'parts';

async function configureIndex() {
  console.log(`⚙️ Configurando reglas, facetas y relevancia en el índice "${INDEX_NAME}" de Algolia...`);

  try {
    await client.setSettings({
      indexName: INDEX_NAME,
      indexSettings: {
        // 1. Campos donde el usuario busca texto libre (Orden de relevancia estricto)
        searchableAttributes: [
          'title',
          'vehicle.model_name', // Ej: "C10" o "Tacoma"
          'vehicle.brand_name', // Ej: "Chevrolet" o "Toyota"
          'part_type.name',     // Ej: "Alternador"
          'part_type.name_en',  // Ej: "Alternator"
          'category.name',      // Ej: "Sistema Eléctrico"
          'category.name_en',   // Ej: "Electrical System"
          'description'
        ],

        // 2. Atributos para crear los filtros laterales (Sidebar de Facetas)
        attributesForFaceting: [
          'filterOnly(status)', // Filtro de seguridad en backend ('available', 'sold')
          'category.name',      // Filtros bilingües listos para la UI
          'category.name_en',
          'part_type.name',
          'part_type.name_en',
          'vehicle.brand_name', // Filtrar por Marca
          'vehicle.model_name', // Filtrar por Modelo
          'vehicle.year',       // Filtrar por Año exacto
          'price'               // Rango de precio
        ],

        // 3. Estrategia de desempate (Priorizar piezas recién listadas por los yonkes)
        customRanking: [
          'desc(created_at)'
        ],

        // 4. Configuración idiomática para soporte transfronterizo (Sonora/USA)
        queryLanguages: ['es', 'en'],
        indexLanguages: ['es', 'en'],
        
        // Si busca algo muy específico como un número de parte y no hay, flexibilizar
        removeWordsIfNoResults: 'allOptional',
        
        // Permitir typos menores en nombres complicados de refacciones
        allowTyposOnNumericTokens: false
      }
    });

    console.log(`✅ Índice "${INDEX_NAME}" configurado con éxito en Algolia.`);
  } catch (error) {
    console.error('❌ Error configurando Algolia:', error);
  }
}

configureIndex();
