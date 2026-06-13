import { supabaseAdmin } from "../src/lib/supabase-admin";
import { algoliasearch } from "algoliasearch";
import * as dotenv from "dotenv";
dotenv.config();

const algoliaClient = algoliasearch(
  process.env.ALGOLIA_APP_ID!,
  process.env.ALGOLIA_ADMIN_API_KEY!,
);
const INDEX_NAME = "parts";

async function generateReport() {
  const { data: dbParts } = await supabaseAdmin
    .from("parts")
    .select("id, title, price_mxn, status, ai_data")
    .limit(3);

  console.log("# Data Parity Audit Report\n");

  for (const part of dbParts || []) {
    const algoliaRes = await algoliaClient.getObject({
      indexName: INDEX_NAME,
      objectID: part.id,
    });

    console.log("## Part ID:", part.id);
    console.log("### Seeding/DB Input (DB Row)");
    console.log(JSON.stringify(part, null, 2));

    console.log("\n### Algolia Counterpart");
    console.log(JSON.stringify(algoliaRes, null, 2));
    console.log("\n---\n");
  }
}
generateReport();
