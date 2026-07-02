import { AlgoliaSearchRepository } from "@/backend/modules/search/infrastructure/algolia-search-repository";
import { SearchFilters } from "@/backend/modules/search/domain/search-filters";
import { Part } from "@/types";
import { mapSearchHitToPart } from "@/lib/search-hit-mapper";
import { ParsedSearchRequest } from "./parse-search-params";

const searchRepository = new AlgoliaSearchRepository();

function toRepositoryFilters(filters: SearchFilters): SearchFilters {
  return {
    makeIds:
      filters.fitmentMake && filters.fitmentMake !== "All Makes"
        ? [filters.fitmentMake]
        : [],
    modelIds:
      filters.fitmentModel && filters.fitmentModel !== "All Models"
        ? [filters.fitmentModel]
        : [],
    yearMin:
      filters.fitmentYear && filters.fitmentYear !== "All Years"
        ? parseInt(String(filters.fitmentYear), 10)
        : undefined,
    categoryIds: filters.category ? [filters.category] : [],
    partTypeIds: filters.partTypes,
    condition: filters.conditions,
    verifiedOnly: filters.sellerType === "trusted",
    priceMin: filters.priceRange[0] > 0 ? filters.priceRange[0] : undefined,
    priceMax: filters.priceRange[1] < 10000 ? filters.priceRange[1] : undefined,
    sortBy: filters.sortBy,
  };
}

export interface ServerSearchResult {
  hits: Part[];
  rawHits: Record<string, unknown>[];
  facets: Record<string, unknown>;
  page: number;
  totalPages: number;
  totalHits: number;
}

export async function fetchSearchResults(
  request: ParsedSearchRequest,
  hitsPerPage = 20,
): Promise<ServerSearchResult> {
  const repositoryFilters = toRepositoryFilters(request.filters);
  repositoryFilters.sortBy = request.sortBy as SearchFilters["sortBy"];

  const result = await searchRepository.search(
    request.query,
    repositoryFilters,
    request.page - 1,
    hitsPerPage,
  );

  const rawHits = result.hits as Record<string, unknown>[];

  return {
    hits: rawHits.map(mapSearchHitToPart),
    rawHits,
    facets: result.facets || {},
    page: result.page,
    totalPages: result.totalPages,
    totalHits: result.totalHits,
  };
}