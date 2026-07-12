import { supabaseAdmin } from "../../../apps/web/src/lib/supabase-admin";
import {
  algoliaClient,
  SEARCH_INDEX_NAME,
} from "../../../apps/web/src/backend/modules/search/infrastructure/algolia-client";
import { logger } from "../../../apps/web/src/lib/logger";
import {
  AUDIT_FIELD_NAMES,
  AttributeMismatch,
  compareIndexFields,
  DEFAULT_DRIFT_THRESHOLD_PERCENT,
  deriveExpectedIndexFields,
  DbPartAuditRow,
} from "../../../apps/web/src/lib/audit/search-audit";

interface AuditResult {
  partsInDb: number;
  partsInIndex: number;
  missingFromIndex: string[];
  staleInIndex: string[];
  attributeMismatches: AttributeMismatch[];
  comparedFields: string[];
  driftPercent: number;
  passed: boolean;
}

const DB_SELECT = `
  id,
  title,
  price_mxn,
  condition,
  status,
  description,
  created_at,
  listing_quality_score,
  seller_trust_score,
  part_images (id),
  part_types!parts_part_type_id_fkey (
    slug_en,
    categories (slug_en)
  ),
  vehicle_variants!parts_donor_vehicle_variant_id_fkey (
    models (name, makes (name))
  ),
  users!parts_seller_id_fkey (
    seller_profiles (verification_status, seller_trust_score, whatsapp)
  )
`;

async function auditSearchConsistency(): Promise<AuditResult> {
  logger.info("Starting search consistency audit...");

  const { data: dbParts, error: dbError } = await supabaseAdmin
    .from("parts")
    .select(DB_SELECT);

  if (dbError) {
    logger.error("Failed to fetch parts from database", { error: dbError });
    throw dbError;
  }

  const dbPartsMap = new Map(
    (dbParts as DbPartAuditRow[]).map((part) => [part.id, part]),
  );
  const dbPartIds = new Set(dbPartsMap.keys());

  const indexPartsMap = new Map<string, Record<string, unknown>>();
  await algoliaClient.browseObjects<Record<string, unknown>>({
    indexName: SEARCH_INDEX_NAME,
    // @ts-expect-error Algolia browse callback options are wider than the published typings.
    attributesToRetrieve: [
      "objectID",
      "title",
      "price",
      "condition",
      "category",
      "part_type",
      "make",
      "model",
      "seller_verified",
      "listing_quality_score",
      "seller_trust_score",
    ],
    batch: (hits: Record<string, unknown>[]) => {
      hits.forEach((hit: Record<string, unknown>) =>
        indexPartsMap.set(String(hit.objectID), hit),
      );
    },
  });

  const indexPartIds = new Set(indexPartsMap.keys());
  const missingFromIndex = [...dbPartIds].filter((id) => !indexPartIds.has(id));
  const staleInIndex = [...indexPartIds].filter((id) => !dbPartIds.has(id));

  const attributeMismatches: AttributeMismatch[] = [];
  const commonIds = [...dbPartIds].filter((id) => indexPartIds.has(id));

  for (const id of commonIds) {
    const dbPart = dbPartsMap.get(id)!;
    const indexPart = indexPartsMap.get(id)!;
    const expected = deriveExpectedIndexFields(dbPart);
    attributeMismatches.push(...compareIndexFields(id, expected, indexPart));
  }

  const totalDrift =
    missingFromIndex.length + staleInIndex.length + attributeMismatches.length;
  const driftPercent =
    dbPartIds.size > 0
      ? Number(((totalDrift / dbPartIds.size) * 100).toFixed(2))
      : 0;

  const result: AuditResult = {
    partsInDb: dbPartIds.size,
    partsInIndex: indexPartIds.size,
    missingFromIndex,
    staleInIndex,
    attributeMismatches,
    comparedFields: [...AUDIT_FIELD_NAMES],
    driftPercent,
    passed: driftPercent <= DEFAULT_DRIFT_THRESHOLD_PERCENT,
  };

  logger.info("Search consistency audit complete", result);
  console.log(JSON.stringify(result, null, 2));

  if (!result.passed) {
    process.exitCode = 1;
  }

  return result;
}

auditSearchConsistency();