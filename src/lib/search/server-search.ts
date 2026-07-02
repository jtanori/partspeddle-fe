import { AlgoliaSearchRepository } from "@/backend/modules/search/infrastructure/algolia-search-repository";
import { SearchFilters as RepositorySearchFilters } from "@/backend/modules/search/domain/search-filters";
import { Part, SearchFilters as UiSearchFilters } from "@/types";
import { mapAlgoliaHitToPart } from "@/lib/search-hit-mapper";
import { ParsedSearchRequest } from "./parse-search-params";

const searchRepository = new AlgoliaSearchRepository();

function toRepositoryFilters(
  filters: UiSearchFilters,
): RepositorySearchFilters {
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
    priceMax:
      filters.priceRange[1] < 10000 ? filters.priceRange[1] : undefined,
    sortBy: filters.sortBy,
  };
}

function toRepositorySortBy(
  sortBy: string,
): RepositorySearchFilters["sortBy"] | undefined {
  if (sortBy === "price_asc" || sortBy === "price_desc" || sortBy === "newest") {
    return sortBy;
  }
  return undefined;
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
  repositoryFilters.sortBy = toRepositorySortBy(request.sortBy);

  const result = await searchRepository.search(
    request.query,
    repositoryFilters,
    request.page - 1,
    hitsPerPage,
  );

  const rawHits = result.hits as unknown as Record<string, unknown>[];

  return {
    hits: rawHits.map(mapAlgoliaHitToPart),
    rawHits,
    facets: result.facets || {},
    page: result.page,
    totalPages: result.totalPages,
    totalHits: result.totalHits,
  };
}