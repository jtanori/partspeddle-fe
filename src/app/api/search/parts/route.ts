import { NextRequest, NextResponse } from "next/server";
import { AlgoliaSearchRepository } from "@/backend/modules/search/infrastructure/algolia-search-repository";
import { VehicleFitmentSearchService } from "@/backend/modules/search/application/vehicle-fitment-search-service";
import {
  searchRequestsTotal,
  searchSuccessTotal,
  searchFailuresTotal,
  searchLatencyMs,
  tracer,
} from "@/lib/observability";
import { logger } from "@/lib/logger";

const searchRepository = new AlgoliaSearchRepository();
const fitmentService = new VehicleFitmentSearchService();

export async function POST(req: NextRequest) {
  searchRequestsTotal.add(1);
  const startTime = performance.now();

  try {
    const body = await req.json();
    const {
      query = "",
      page = 0,
      hitsPerPage = 20,
      fitment, // Optional: { makeId, modelId, year }
      system,
      category,
      partTypes,
      fitmentMake,
      fitmentModel,
      fitmentYear,
      fitmentEngine,
      conditions,
      priceRange,
      sellerType,
      sortBy,
    } = body;

    if (query && query.length > 1000) {
      return NextResponse.json({ error: "Query too long" }, { status: 400 });
    }

    const filters = {
      makeIds:
        fitmentMake && fitmentMake !== "All Makes"
          ? Array.isArray(fitmentMake)
            ? fitmentMake
            : [fitmentMake]
          : [],
      modelIds:
        fitmentModel && fitmentModel !== "All Models"
          ? Array.isArray(fitmentModel)
            ? fitmentModel
            : [fitmentModel]
          : [],
      yearMin:
        fitmentYear && fitmentYear !== "All Years"
          ? typeof fitmentYear === "string"
            ? parseInt(fitmentYear)
            : fitmentYear
          : undefined,
      categoryIds: category
        ? Array.isArray(category)
          ? category
          : [category]
        : system
          ? Array.isArray(system)
            ? system
            : [system]
          : [],
      partTypeIds: Array.isArray(partTypes)
        ? partTypes
        : partTypes
          ? [partTypes]
          : [],
      condition: Array.isArray(conditions)
        ? conditions
        : conditions
          ? [conditions]
          : [],
      verifiedOnly: sellerType === "trusted",
      // Ignore default range [0, 10000]
      priceMin:
        Array.isArray(priceRange) && priceRange[0] > 0
          ? priceRange[0]
          : undefined,
      priceMax:
        Array.isArray(priceRange) && priceRange[1] < 10000
          ? priceRange[1]
          : undefined,
      sortBy,
    };

    let fitmentFilterIds: string[] | null = null;
    if (fitment?.makeId && fitment?.modelId && fitment?.year) {
      fitmentFilterIds = await fitmentService.getCompatiblePartIds(fitment);
    }

    const result = await tracer.startActiveSpan(
      "search-repository-query",
      async (span) => {
        span.setAttributes({ query, page, hitsPerPage });
        const searchResult = await searchRepository.search(
          query,
          filters,
          Number(page),
          Number(hitsPerPage),
        );
        span.end();
        return searchResult;
      },
    );

    const filteredHits = fitmentFilterIds
      ? result.hits.filter((hit) => fitmentFilterIds!.includes(hit.objectID))
      : result.hits;

    searchSuccessTotal.add(1);
    searchLatencyMs.record(performance.now() - startTime);

    return NextResponse.json({
      hits: filteredHits,
      facets: result.facets || {},
      totalHits: result.totalHits,
      page: result.page,
      totalPages: result.totalPages,
    });
  } catch (error: any) {
    searchFailuresTotal.add(1);
    // Log detailed error for debugging
    console.error("❌ Search API Error:", error);
    logger.error("Search API degradation - returning empty results", {
      errorMessage: error.message,
      errorName: error.name,
      stack: error.stack,
    });
    return NextResponse.json(
      {
        hits: [],
        facets: {},
        totalHits: 0,
        warning: `Search currently unavailable: ${error.message}`,
      },
      { status: 200 },
    );
  }
}
