import { algoliasearch } from 'algoliasearch';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Forzar la carga de .env desde la raíz del proyecto
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const client = algoliasearch(
  process.env.ALGOLIA_APP_ID!,
  process.env.ALGOLIA_ADMIN_API_KEY!
);

// IMPORTANTE: Asegurar que coincida con el ALGOLIA_INDEX_NAME de tu Edge Function
const INDEX_NAME = 'parts';

async function configureIndex() {
  console.log(`⚙️ Configurando reglas, facetas y relevancia en el índice "${INDEX_NAME}" de Algolia...`);

  try {
    await client.setSettings({
      indexName: INDEX_NAME,
      indexSettings: {
        searchableAttributes: [
          'title',
          'make',
          'model',
          'part_type',
          'category',
          'description'
        ],
        attributesForFaceting: [
          'filterOnly(status)',
          'category',
          'part_type',
          'make',
          'model',
          'year',
          'condition',
          'seller_verified',
          'price'
        ],
        customRanking: ['desc(created_at)'],
        queryLanguages: ['es', 'en'],
        indexLanguages: ['es', 'en'],
        removeWordsIfNoResults: 'allOptional',
        allowTyposOnNumericTokens: false,
        // Define replicas
        replicas: [
          'parts_price_asc',
          'parts_price_desc',
          'parts_newest'
        ]
      }
    });

    // Configure each replica
    await client.setSettings({
        indexName: 'parts_price_asc',
        indexSettings: {
            customRanking: ['asc(price)']
        }
    });

    await client.setSettings({
        indexName: 'parts_price_desc',
        indexSettings: {
            customRanking: ['desc(price)']
        }
    });

    await client.setSettings({
        indexName: 'parts_newest',
        indexSettings: {
            customRanking: ['desc(created_at)']
        }
    });

    console.log(`✅ Índice "${INDEX_NAME}" configurado con éxito en Algolia.`);
  } catch (error) {
    console.error('❌ Error configurando Algolia:', error);
  }
}

configureIndex();
