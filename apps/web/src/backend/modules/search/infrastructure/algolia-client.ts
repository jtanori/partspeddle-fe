import { algoliasearch, type SearchClient } from 'algoliasearch';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

let _algoliaClient: SearchClient | null = null;

function getAlgoliaClient(): SearchClient {
  if (!_algoliaClient) {
    _algoliaClient = algoliasearch(
      process.env.ALGOLIA_APP_ID || '',
      process.env.ALGOLIA_ADMIN_KEY || '',
    );
  }
  return _algoliaClient;
}

/**
 * Lazy Algolia client proxy. Delays client construction until first use so
 * that importing this module during Next.js static generation does not fail
 * when ALGOLIA_APP_ID / ALGOLIA_ADMIN_KEY are not available at build time.
 */
export const algoliaClient = new Proxy({} as SearchClient, {
  get(_target, prop) {
    const client = getAlgoliaClient();
    const value = (client as any)[prop];
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  },
});

const algoliaSearchIndexName = process.env.ALGOLIA_SEARCH_INDEX_NAME || 'parts';

export const SEARCH_INDEX_NAME = algoliaSearchIndexName;
export const INDEX_PRICE_ASC =
  process.env.ALGOLIA_INDEX_PRICE_ASC || `${SEARCH_INDEX_NAME}_price_asc`;
export const INDEX_PRICE_DESC =
  process.env.ALGOLIA_INDEX_PRICE_DESC || `${SEARCH_INDEX_NAME}_price_desc`;
export const INDEX_NEWEST = process.env.ALGOLIA_INDEX_NEWEST || `${SEARCH_INDEX_NAME}_newest`;
