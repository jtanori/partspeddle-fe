import { algoliasearch } from "algoliasearch";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

export const algoliaClient = algoliasearch(
  process.env.ALGOLIA_APP_ID || "",
  process.env.ALGOLIA_ADMIN_API_KEY || "",
);

export const SEARCH_INDEX_NAME =
  process.env.ALGOLIA_SEARCH_INDEX_NAME || "parts";
export const INDEX_PRICE_ASC =
  process.env.ALGOLIA_INDEX_PRICE_ASC || "parts_price_asc";
export const INDEX_PRICE_DESC =
  process.env.ALGOLIA_INDEX_PRICE_DESC || "parts_price_desc";
export const INDEX_NEWEST = process.env.ALGOLIA_INDEX_NEWEST || "parts_newest";
