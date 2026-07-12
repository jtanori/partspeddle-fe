import { algoliasearch } from "algoliasearch";
import * as dotenv from "dotenv";
dotenv.config();

const client = algoliasearch(
  process.env.ALGOLIA_APP_ID!,
  process.env.ALGOLIA_ADMIN_KEY!,
);

async function verify() {
  const result = await client.search({
    requests: [
      {
        indexName: "parts",
        query: "Test Part Algolia",
      },
    ],
  });

  if ((result.results[0] as any).nbHits > 0) {
    console.log("✅ Sincronización exitosa. Documento encontrado en Algolia.");
  } else {
    console.log("❌ Error: No se encontró el documento en Algolia.");
  }
}

verify();
