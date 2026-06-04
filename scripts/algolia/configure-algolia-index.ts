import { algoliaClient, SEARCH_INDEX_NAME } from '../../src/backend/modules/search/infrastructure/algolia-client';

async function configureIndex() {
  console.log(`⚙️ Configuring settings for index "${SEARCH_INDEX_NAME}"...`);
  try {
    await algoliaClient.setSettings({
      indexName: SEARCH_INDEX_NAME,
      indexSettings: {
        searchableAttributes: ['title', 'partTypeName', 'categoryName', 'description', 'oemNumber', 'partNumber'],
        attributesForFaceting: ['condition', 'categoryName', 'partTypeName', 'sellerVerified', 'makeNames', 'modelNames'],
        ranking: [
          'desc(sellerVerified)',
          'desc(sellerTrustScore)',
          'desc(listingQualityScore)',
          'desc(createdAt)',
          'typo', 'geo', 'words', 'filters', 'proximity', 'attribute', 'exact', 'custom'
        ]
      }
    });
    console.log('✅ Index settings updated.');
  } catch (error) {
    console.error('❌ Error configuring index:', error);
  }
}

configureIndex();
