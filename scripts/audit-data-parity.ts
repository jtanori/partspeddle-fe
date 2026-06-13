import { supabaseAdmin } from "../src/lib/supabase-admin";
import { algoliasearch } from "algoliasearch";
import * as dotenv from "dotenv";
dotenv.config();

const algoliaClient = algoliasearch(
  process.env.ALGOLIA_APP_ID || "",
  process.env.ALGOLIA_ADMIN_API_KEY || "",
);
const INDEX_NAME = "parts";

async function auditParity() {
  console.log("🔍 Starting Data Parity Audit...");

  const { data: dbParts, error: dbError } = await supabaseAdmin
    .from("parts")
    .select("id, title, price_mxn, status")
    .eq("status", "available")
    .limit(5);

  if (dbError) {
    console.error("❌ DB Query Error:", dbError);
    return;
  }

  const objectIDs = dbParts.map((p) => p.id);
  const response = await algoliaClient.getObjects({
    requests: objectIDs.map((objectID) => ({
      indexName: INDEX_NAME,
      objectID,
    })),
  });

  // Log response to understand structure
  console.log("Algolia response:", JSON.stringify(response, null, 2));

  const algoliaParts = response.results;

  dbParts.forEach((dbPart) => {
    const algoliaPart = algoliaParts.find(
      (p: any) => p && p.objectID === dbPart.id,
    ) as any;

    console.log(`\n--- Part: ${dbPart.id} (${dbPart.title}) ---`);
    if (!algoliaPart) {
      console.log("❌ Missing in Algolia");
    } else {
      console.log("✅ Found in Algolia");
      const diff: any = {};

      if (dbPart.title !== algoliaPart.title)
        diff.title = { db: dbPart.title, algolia: algoliaPart.title };
      if (dbPart.price_mxn !== algoliaPart.price)
        diff.price = { db: dbPart.price_mxn, algolia: algoliaPart.price };

      if (Object.keys(diff).length > 0) {
        console.log("⚠️ Mismatch found:", diff);
      } else {
        console.log("✨ Data matches");
      }
    }
  });
}

auditParity();
