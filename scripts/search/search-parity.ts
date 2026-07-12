import {
  algoliaClient,
  SEARCH_INDEX_NAME,
} from "../../src/backend/modules/search/infrastructure/algolia-client";
import { logger } from "../../src/lib/logger";
import {
  computeFacetParityPercent,
  DEFAULT_FACET_PARITY_THRESHOLD_PERCENT,
  EXPECTED_FACET_ATTRIBUTES,
  passesFacetParityThreshold,
} from "../../src/lib/audit/search-audit";

interface SearchParityResult {
  facetParityPercent: number;
  expectedFacetAttributes: string[];
  observedFacetAttributes: string[];
  missingFacetAttributes: string[];
  sampleHitFieldCoverage: Record<string, boolean>;
  passed: boolean;
}

const REQUIRED_HIT_FIELDS = [
  "objectID",
  "title",
  "price",
  "category",
  "category_label",
  "part_type",
  "part_type_label",
  "make",
  "model",
  "seller_verified",
  "listing_quality_score",
  "seller_trust_score",
];

async function auditSearchParity(): Promise<SearchParityResult> {
  logger.info("Starting search facet parity audit...");

  const result = await algoliaClient.search({
    requests: [
      {
        indexName: SEARCH_INDEX_NAME,
        query: "",
        hitsPerPage: 10,
        facets: [...EXPECTED_FACET_ATTRIBUTES],
      },
    ],
  });

  const response = result.results[0] as {
    facets?: Record<string, Record<string, number>>;
    hits?: Record<string, unknown>[];
    error?: string;
  };

  if (response.error) {
    throw new Error(`Algolia search parity error: ${response.error}`);
  }

  const facetParityPercent = computeFacetParityPercent(response.facets);
  const observedFacetAttributes = Object.keys(response.facets || {});
  const missingFacetAttributes = EXPECTED_FACET_ATTRIBUTES.filter(
    (facet) => !observedFacetAttributes.includes(facet),
  );

  const sampleHit = response.hits?.[0] || {};
  const sampleHitFieldCoverage = Object.fromEntries(
    REQUIRED_HIT_FIELDS.map((field) => [field, field in sampleHit]),
  );

  const hitCoveragePassed = REQUIRED_HIT_FIELDS.every(
    (field) => sampleHitFieldCoverage[field],
  );
  const facetParityPassed = passesFacetParityThreshold(response.facets);

  const auditResult: SearchParityResult = {
    facetParityPercent,
    expectedFacetAttributes: [...EXPECTED_FACET_ATTRIBUTES],
    observedFacetAttributes,
    missingFacetAttributes,
    sampleHitFieldCoverage,
    passed: facetParityPassed && hitCoveragePassed,
  };

  logger.info("Search facet parity audit complete", auditResult);
  console.log(JSON.stringify(auditResult, null, 2));

  if (!auditResult.passed) {
    console.error(
      `Search parity failed: facet parity must be >= ${DEFAULT_FACET_PARITY_THRESHOLD_PERCENT}% and sample hits must include required fields.`,
    );
    process.exitCode = 1;
  }

  return auditResult;
}

auditSearchParity();