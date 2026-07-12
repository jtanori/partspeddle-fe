import { AlgoliaSearchRepository } from "../../../apps/web/src/backend/modules/search/infrastructure/algolia-search-repository";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

async function debugSearch() {
  const repo = new AlgoliaSearchRepository();

  const testCases = [
    { name: "Empty Filters", filters: { sortBy: "newest" } },
    { name: "Empty String Make", filters: { makeIds: [""], sortBy: "newest" } },
    {
      name: "All Makes String",
      filters: { makeIds: ["All Makes"], sortBy: "newest" },
    },
    { name: "Null Price", filters: { priceMin: null, sortBy: "newest" } },
    {
      name: "Undefined Year",
      filters: { yearMin: undefined, sortBy: "newest" },
    },
  ];

  for (const tc of testCases) {
    console.log(`\n🔍 Testing Case: ${tc.name}`);
    try {
      const result = await repo.search("", tc.filters as any, 0, 20);
      console.log(`✅ Success! Hits: ${result.hits.length}`);
    } catch (error: any) {
      console.error(`❌ Failed!`);
      console.error(`Error: ${error.message}`);
      // Log the generated filters if we can access them (we'd need to modify the repo or use a proxy)
    }
  }
}

debugSearch();
