import {
  algoliaClient,
  SEARCH_INDEX_NAME,
  INDEX_PRICE_ASC,
  INDEX_PRICE_DESC,
  INDEX_NEWEST,
} from '../../apps/web/src/backend/modules/search/infrastructure/algolia-client';

const INDEX_INITIALIZER_OBJECT_ID = '__index_initializer__';

/**
 * Ensure an Algolia index physically exists.
 *
 * `setSettings` on a non-existent index does not always persist the index in
 * Algolia until at least one object has been written. This causes the Fly.io
 * health check (`/api/health`) to fail with "Index does not exist" on brand
 * new environments. We probe the index and, if missing, create it by saving a
 * temporary object and immediately deleting it, leaving an empty index that
 * `getSettings` will recognise as existing.
 */
async function ensureIndexExists(indexName: string) {
  try {
    await algoliaClient.getSettings({ indexName });
    return;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!message.toLowerCase().includes('index does not exist')) {
      throw error;
    }
  }

  await algoliaClient.saveObjects({
    indexName,
    objects: [
      {
        objectID: INDEX_INITIALIZER_OBJECT_ID,
        __meta: 'created by configure-algolia-index',
      },
    ],
  });
  await algoliaClient.deleteObject({
    indexName,
    objectID: INDEX_INITIALIZER_OBJECT_ID,
  });
  console.log(`✅ Created index "${indexName}".`);
}

async function configureIndex() {
  console.log(`⚙️ Configuring settings for index "${SEARCH_INDEX_NAME}" and its replicas...`);
  try {
    // Ensure all indices exist before configuring settings, otherwise the
    // runtime health check reports Algolia as unavailable on fresh apps.
    await ensureIndexExists(SEARCH_INDEX_NAME);
    await ensureIndexExists(INDEX_PRICE_ASC);
    await ensureIndexExists(INDEX_PRICE_DESC);
    await ensureIndexExists(INDEX_NEWEST);

    // 1. Primary Index Settings
    await algoliaClient.setSettings({
      indexName: SEARCH_INDEX_NAME,
      indexSettings: {
        searchableAttributes: [
          'title',
          'part_type',
          'category',
          'description',
          'make',
          'model',
          'seller_name',
        ],
        attributesForFaceting: [
          'searchable(category)',
          'searchable(part_type)',
          'searchable(make)',
          'searchable(model)',
          'condition',
          'seller_verified',
          'location',
          'year',
          'filterOnly(fitment_signatures)',
        ],
        customRanking: [
          'desc(listing_quality_score)',
          'desc(seller_trust_score)',
          'desc(created_at)',
        ],
        ranking: ['typo', 'geo', 'words', 'filters', 'proximity', 'attribute', 'exact'],
        // Set replicas
        replicas: [INDEX_PRICE_ASC, INDEX_PRICE_DESC, INDEX_NEWEST],
        removeStopWords: ['es'],
        ignorePlurals: ['es'],
        attributeForDistinct: 'objectID',
        distinct: 1,
      },
    });
    console.log('✅ Primary index settings and replicas configured.');

    // 2. Replica: Price Ascending
    await algoliaClient.setSettings({
      indexName: INDEX_PRICE_ASC,
      indexSettings: {
        ranking: [
          'asc(price)',
          'typo',
          'geo',
          'words',
          'filters',
          'proximity',
          'attribute',
          'exact',
          'custom',
        ],
        customRanking: [
          'desc(listing_quality_score)',
          'desc(seller_trust_score)',
          'desc(created_at)',
        ],
      },
    });
    console.log(`✅ Replica "${INDEX_PRICE_ASC}" (Price ASC) configured.`);

    // 3. Replica: Price Descending
    await algoliaClient.setSettings({
      indexName: INDEX_PRICE_DESC,
      indexSettings: {
        ranking: [
          'desc(price)',
          'typo',
          'geo',
          'words',
          'filters',
          'proximity',
          'attribute',
          'exact',
          'custom',
        ],
        customRanking: [
          'desc(listing_quality_score)',
          'desc(seller_trust_score)',
          'desc(created_at)',
        ],
      },
    });
    console.log(`✅ Replica "${INDEX_PRICE_DESC}" (Price DESC) configured.`);

    // 4. Replica: Newest First
    await algoliaClient.setSettings({
      indexName: INDEX_NEWEST,
      indexSettings: {
        ranking: [
          'desc(created_at)',
          'typo',
          'geo',
          'words',
          'filters',
          'proximity',
          'attribute',
          'exact',
          'custom',
        ],
        customRanking: ['desc(listing_quality_score)', 'desc(seller_trust_score)'],
      },
    });
    console.log(`✅ Replica "${INDEX_NEWEST}" (Newest) configured.`);

    console.log('✨ All index and replica configurations applied successfully.');
  } catch (error) {
    console.error('❌ Error configuring indices:', error);
    process.exit(1);
  }
}

configureIndex();
