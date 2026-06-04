import { algoliasearch } from 'algoliasearch';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export const algoliaClient = algoliasearch(
  process.env.VITE_ALGOLIA_APP_ID || '',
  process.env.VITE_ALGOLIA_ADMIN_API_KEY || ''
);

export const SEARCH_INDEX_NAME = 'vintrack_parts_v1';

// Set settings for ranking
algoliaClient.setSettings({
  indexName: SEARCH_INDEX_NAME,
  indexSettings: {
    searchableAttributes: ['title', 'partTypeName', 'categoryName', 'description'],
    attributesForFaceting: ['condition', 'categoryName', 'partTypeName', 'sellerVerified', 'makeNames', 'modelNames'],
    ranking: [
      'desc(sellerVerified)',
      'desc(sellerTrustScore)',
      'desc(listingQualityScore)',
      'desc(createdAt)',
      'typo',
      'geo',
      'words',
      'filters',
      'proximity',
      'attribute',
      'exact',
      'custom'
    ]
  }
}).catch(console.error);
