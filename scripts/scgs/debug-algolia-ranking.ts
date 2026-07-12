import { algoliaClient, SEARCH_INDEX_NAME } from "../../apps/web/src/backend/modules/search/infrastructure/algolia-client";

async function debugRanking(query: string) {
  try {
    const results = await algoliaClient.search({
      requests: [{
        indexName: SEARCH_INDEX_NAME,
        query,
        hitsPerPage: 20,
        // Crucial for understanding why Algolia ranked items as it did
        getRankingInfo: true,
      }]
    });

    const hits = (results.results[0] as any).hits;
    
    // Clean and dump hits for investigation
    const output = hits.map((h: any) => ({
      objectID: h.objectID,
      title: h.title,
      // Include factors we are trying to port
      listing_quality_score: h.listing_quality_score,
      seller_trust_score: h.seller_trust_score,
      created_at: h.created_at,
      // Include raw ranking info to see why Algolia picked this order
      _rankingInfo: h._rankingInfo
    }));

    console.log(JSON.stringify(output, null, 2));
  } catch (err) {
    console.error(err);
  }
}

const query = process.argv[2] || "alternator";
debugRanking(query).catch(console.error);
