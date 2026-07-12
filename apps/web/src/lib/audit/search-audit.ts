export const AUDIT_FIELD_NAMES = [
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
] as const;

export type AuditFieldName = (typeof AUDIT_FIELD_NAMES)[number];

export const EXPECTED_FACET_ATTRIBUTES = [
  "category",
  "part_type",
  "make",
  "model",
  "year",
  "condition",
  "seller_verified",
] as const;

export const DEFAULT_DRIFT_THRESHOLD_PERCENT = 5;
export const DEFAULT_FACET_PARITY_THRESHOLD_PERCENT = 95;

export interface AttributeMismatch {
  id: string;
  field: AuditFieldName;
  db: unknown;
  algolia: unknown;
}

export interface DbPartAuditRow {
  id: string;
  title?: string | null;
  price_mxn?: number | null;
  condition?: string | null;
  listing_quality_score?: number | null;
  seller_trust_score?: number | null;
  part_types?: {
    slug_en?: string | null;
    categories?: { slug_en?: string | null } | { slug_en?: string | null }[];
  } | {
    slug_en?: string | null;
    categories?: { slug_en?: string | null } | { slug_en?: string | null }[];
  }[];
  vehicle_variants?: {
    models?: {
      name?: string | null;
      makes?: { name?: string | null } | { name?: string | null }[];
    } | {
      name?: string | null;
      makes?: { name?: string | null } | { name?: string | null }[];
    }[];
  } | {
    models?: {
      name?: string | null;
      makes?: { name?: string | null } | { name?: string | null }[];
    } | {
      name?: string | null;
      makes?: { name?: string | null } | { name?: string | null }[];
    }[];
  }[];
  users?: {
    seller_profiles?: {
      verification_status?: string | null;
      seller_trust_score?: number | null;
      whatsapp?: string | null;
    } | {
      verification_status?: string | null;
      seller_trust_score?: number | null;
      whatsapp?: string | null;
    }[];
  } | {
    seller_profiles?: {
      verification_status?: string | null;
      seller_trust_score?: number | null;
      whatsapp?: string | null;
    } | {
      verification_status?: string | null;
      seller_trust_score?: number | null;
      whatsapp?: string | null;
    }[];
  }[];
  part_images?: { id: string }[] | null;
  description?: string | null;
  created_at?: string | null;
}

function firstRelation<T>(value: T | T[] | null | undefined): T | undefined {
  if (!value) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

export function deriveExpectedIndexFields(dbPart: DbPartAuditRow) {
  const partType = firstRelation(dbPart.part_types);
  const category = firstRelation(partType?.categories);
  const vehicleVariant = firstRelation(dbPart.vehicle_variants);
  const vehicleModel = firstRelation(vehicleVariant?.models);
  const vehicleMake = firstRelation(vehicleModel?.makes);
  const user = firstRelation(dbPart.users);
  const sellerProfile = firstRelation(user?.seller_profiles);

  let sellerTrustScore = 40;
  if (sellerProfile?.verification_status === "verified") sellerTrustScore += 40;
  if (sellerProfile?.whatsapp) sellerTrustScore += 20;

  let listingQualityScore = 0;
  const imageCount = dbPart.part_images?.length || 0;
  if (imageCount > 0) listingQualityScore += 20;
  if (imageCount >= 3) listingQualityScore += 15;
  if (dbPart.description && dbPart.description.length > 100) listingQualityScore += 15;
  if (dbPart.description && dbPart.description.length > 300) listingQualityScore += 10;
  if (sellerProfile?.verification_status === "verified") listingQualityScore += 25;
  if (dbPart.created_at) {
    const daysOld =
      (Date.now() - new Date(dbPart.created_at).getTime()) / (1000 * 60 * 60 * 24);
    if (daysOld < 30) listingQualityScore += 15;
  }

  return {
    title: dbPart.title || "",
    price: dbPart.price_mxn || 0,
    condition: dbPart.condition || "USED_GOOD",
    category: category?.slug_en || "other",
    part_type: partType?.slug_en || "general",
    make: vehicleMake?.name || "Universal",
    model: vehicleModel?.name || "N/A",
    seller_verified: sellerProfile?.verification_status === "verified",
    listing_quality_score:
      dbPart.listing_quality_score ?? listingQualityScore,
    seller_trust_score:
      dbPart.seller_trust_score ??
      sellerProfile?.seller_trust_score ??
      sellerTrustScore,
  };
}

export function compareIndexFields(
  id: string,
  expected: ReturnType<typeof deriveExpectedIndexFields>,
  algolia: Record<string, unknown>,
): AttributeMismatch[] {
  const mismatches: AttributeMismatch[] = [];

  for (const field of AUDIT_FIELD_NAMES) {
    const expectedValue = expected[field];
    const algoliaValue = algolia[field];

    if (expectedValue !== algoliaValue) {
      mismatches.push({
        id,
        field,
        db: expectedValue,
        algolia: algoliaValue,
      });
    }
  }

  return mismatches;
}

export function computeFacetParityPercent(
  actualFacets: Record<string, Record<string, number>> | undefined,
  expectedFacetKeys: readonly string[] = EXPECTED_FACET_ATTRIBUTES,
): number {
  if (!actualFacets || expectedFacetKeys.length === 0) return 0;

  const matched = expectedFacetKeys.filter((facetKey) => {
    const values = actualFacets[facetKey];
    return values && Object.keys(values).length > 0;
  });

  return Number(((matched.length / expectedFacetKeys.length) * 100).toFixed(2));
}

export function passesFacetParityThreshold(
  actualFacets: Record<string, Record<string, number>> | undefined,
  thresholdPercent = DEFAULT_FACET_PARITY_THRESHOLD_PERCENT,
): boolean {
  return computeFacetParityPercent(actualFacets) >= thresholdPercent;
}