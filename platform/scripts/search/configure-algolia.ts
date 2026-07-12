import { algoliasearch } from 'algoliasearch';
import * as dotenv from 'dotenv';
import * as path from 'path';
import {
  INDEX_NEWEST,
  INDEX_PRICE_ASC,
  INDEX_PRICE_DESC,
  SEARCH_INDEX_NAME,
} from '../../../apps/web/src/backend/modules/search/infrastructure/algolia-client';

// Forzar la carga de .env desde la raíz del proyecto
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const client = algoliasearch(process.env.ALGOLIA_APP_ID!, process.env.ALGOLIA_ADMIN_KEY!);

const INDEX_NAME = SEARCH_INDEX_NAME;

async function configureIndex() {
  console.log(
    `⚙️ Configurando reglas, facetas y relevancia en el índice "${INDEX_NAME}" de Algolia...`,
  );

  try {
    await client.setSettings({
      indexName: INDEX_NAME,
      indexSettings: {
        searchableAttributes: ['title', 'make', 'model', 'part_type', 'category', 'description'],
        attributesForFaceting: [
          'filterOnly(status)',
          'category',
          'part_type',
          'make',
          'model',
          'year',
          'condition',
          'seller_verified',
          'price',
        ],
        customRanking: ['desc(created_at)'],
        queryLanguages: ['es', 'en'],
        indexLanguages: ['es', 'en'],
        removeWordsIfNoResults: 'allOptional',
        allowTyposOnNumericTokens: false,
        // Define replicas
        replicas: [INDEX_PRICE_ASC, INDEX_PRICE_DESC, INDEX_NEWEST],
      },
    });

    // Configure each replica
    await client.setSettings({
      indexName: INDEX_PRICE_ASC,
      indexSettings: {
        customRanking: ['asc(price)'],
      },
    });

    await client.setSettings({
      indexName: INDEX_PRICE_DESC,
      indexSettings: {
        customRanking: ['desc(price)'],
      },
    });

    await client.setSettings({
      indexName: INDEX_NEWEST,
      indexSettings: {
        customRanking: ['desc(created_at)'],
      },
    });

    console.log(`✅ Índice "${INDEX_NAME}" configurado con éxito en Algolia.`);
  } catch (error) {
    console.error('❌ Error configurando Algolia:', error);
  }
}

configureIndex();
