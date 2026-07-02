import { PartCondition, SearchFilters } from "@/types";

export interface ParsedSearchRequest {
  query: string;
  sortBy: string;
  page: number;
  view: "grid" | "list";
  filters: SearchFilters;
}

function readParam(
  params: Record<string, string | string[] | undefined>,
  key: string,
): string {
  const value = params[key];
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

function readAllParams(
  params: Record<string, string | string[] | undefined>,
  key: string,
): string[] {
  const value = params[key];
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

export function parseSearchParams(
  params: Record<string, string | string[] | undefined>,
): ParsedSearchRequest {
  const query = readParam(params, "q");
  const sortBy = readParam(params, "sort") || "newest";
  const page = Math.max(1, Number(readParam(params, "page") || "1"));
  const view = readParam(params, "view") === "list" ? "list" : "grid";

  const filters: SearchFilters = {
    query,
    system: readParam(params, "system"),
    category: readParam(params, "category"),
    partTypes: readAllParams(params, "partType"),
    fitmentMake: readParam(params, "fitmentMake") || "All Makes",
    fitmentModel: readParam(params, "fitmentModel") || "All Models",
    fitmentYear: readParam(params, "fitmentYear") || "All Years",
    fitmentEngine: readParam(params, "fitmentEngine") || "All Engines",
    featured: readParam(params, "featured") === "true",
    priceRange: [
      parseInt(readParam(params, "minPrice") || "0", 10),
      parseInt(readParam(params, "maxPrice") || "10000", 10),
    ],
    conditions: readAllParams(params, "condition") as PartCondition[],
    sellerType: (readParam(params, "sellerType") as SearchFilters["sellerType"]) || "all",
  };

  return { query, sortBy, page, view, filters };
}

export function serializeSearchRequest(request: ParsedSearchRequest): string {
  return JSON.stringify({
    query: request.query,
    sortBy: request.sortBy,
    page: request.page,
    filters: request.filters,
  });
}