import { supabaseAdmin } from "../../../apps/web/src/lib/supabase-admin";
import {
  algoliaClient,
  SEARCH_INDEX_NAME,
} from "../../../apps/web/src/backend/modules/search/infrastructure/algolia-client";

async function reconcileSearchIndex() {
  console.log("🔍 Starting index drift detection...");

  try {
    // 1. Get all active part IDs from Postgres
    const { data: dbParts, error: dbError } = await supabaseAdmin
      .from("parts")
      .select("id")
      .eq("status", "AVAILABLE");

    if (dbError) throw dbError;
    const dbPartIds = new Set(dbParts?.map((p) => p.id) || []);

    // 2. Get all objectIDs from Algolia
    const algoliaPartIds = new Set<string>();
    await algoliaClient.browseObjects({
      indexName: SEARCH_INDEX_NAME,
      // @ts-expect-error - Algolia client type mismatch in script context
      batch: (hits) => {
        hits.forEach((hit) => algoliaPartIds.add(hit.objectID as string));
      },
    });

    // 3. Compare
    const missingInAlgolia = [...dbPartIds].filter(
      (id) => !algoliaPartIds.has(id),
    );
    const extraInAlgolia = [...algoliaPartIds].filter(
      (id) => !dbPartIds.has(id),
    );

    console.log(`Report:`);
    console.log(`- Postgres active parts: ${dbPartIds.size}`);
    console.log(`- Algolia documents: ${algoliaPartIds.size}`);
    console.log(`- Missing in Algolia: ${missingInAlgolia.length}`);
    console.log(`- Extra in Algolia (Stale): ${extraInAlgolia.length}`);

    if (missingInAlgolia.length > 0) {
      console.warn(
        "⚠️ Found parts missing in Algolia. Run reindex for these IDs.",
      );
    }
    if (extraInAlgolia.length > 0) {
      console.warn("⚠️ Found stale documents in Algolia. Run cleanup.");
    }
  } catch (error) {
    console.error("❌ Drift detection failed:", error);
  }
}

reconcileSearchIndex();
