import {
  algoliaClient,
  SEARCH_INDEX_NAME,
  INDEX_PRICE_ASC,
  INDEX_PRICE_DESC,
  INDEX_NEWEST,
} from "../../src/backend/modules/search/infrastructure/algolia-client";

async function configureIndex() {
  console.log(
    `⚙️ Configuring settings for index "${SEARCH_INDEX_NAME}" and its replicas...`,
  );
  try {
    // 1. Primary Index Settings
    await algoliaClient.setSettings({
      indexName: SEARCH_INDEX_NAME,
      indexSettings: {
        searchableAttributes: [
          "title",
          "part_type",
          "category",
          "description",
          "make",
          "model",
          "seller_name",
        ],
        attributesForFaceting: [
          "searchable(category)",
          "searchable(part_type)",
          "searchable(make)",
          "searchable(model)",
          "condition",
          "seller_verified",
          "location",
          "year",
        ],
        customRanking: [],
        ranking: [
          "typo",
          "geo",
          "words",
          "filters",
          "proximity",
          "attribute",
          "exact",
        ],
        // Set replicas
        replicas: [INDEX_PRICE_ASC, INDEX_PRICE_DESC, INDEX_NEWEST],
        removeStopWords: ["es"],
        ignorePlurals: ["es"],
        attributeForDistinct: "objectID",
        distinct: 1,
      },
    });
    console.log("✅ Primary index settings and replicas configured.");

    // 2. Replica: Price Ascending
    await algoliaClient.setSettings({
      indexName: INDEX_PRICE_ASC,
      indexSettings: {
        ranking: [
          "asc(price)",
          "typo",
          "geo",
          "words",
          "filters",
          "proximity",
          "attribute",
          "exact",
          "custom",
        ],
        customRanking: [
          "desc(listing_quality_score)",
          "desc(seller_trust_score)",
          "desc(created_at)",
        ],
      },
    });
    console.log(`✅ Replica "${INDEX_PRICE_ASC}" (Price ASC) configured.`);

    // 3. Replica: Price Descending
    await algoliaClient.setSettings({
      indexName: INDEX_PRICE_DESC,
      indexSettings: {
        ranking: [
          "desc(price)",
          "typo",
          "geo",
          "words",
          "filters",
          "proximity",
          "attribute",
          "exact",
          "custom",
        ],
        customRanking: [
          "desc(listing_quality_score)",
          "desc(seller_trust_score)",
          "desc(created_at)",
        ],
      },
    });
    console.log(`✅ Replica "${INDEX_PRICE_DESC}" (Price DESC) configured.`);

    // 4. Replica: Newest First
    await algoliaClient.setSettings({
      indexName: INDEX_NEWEST,
      indexSettings: {
        ranking: [
          "desc(created_at)",
          "typo",
          "geo",
          "words",
          "filters",
          "proximity",
          "attribute",
          "exact",
          "custom",
        ],
        customRanking: [
          "desc(listing_quality_score)",
          "desc(seller_trust_score)",
        ],
      },
    });
    console.log(`✅ Replica "${INDEX_NEWEST}" (Newest) configured.`);

    console.log(
      "✨ All index and replica configurations applied successfully.",
    );
  } catch (error) {
    console.error("❌ Error configuring indices:", error);
  }
}

configureIndex();
