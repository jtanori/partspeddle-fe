import { SearchViewModel, SearchParityReport } from "../domain/view-models/search";

export function computeSearchParity(
  legacy: SearchViewModel,
  modern: SearchViewModel
): SearchParityReport {
  const legacyIds = new Set(legacy.results.map((r) => r.id));
  const modernIds = new Set(modern.results.map((r) => r.id));

  const top10Legacy = legacy.results.slice(0, 10).map((r) => r.id);
  const top10Modern = modern.results.slice(0, 10).map((r) => r.id);
  const top10Overlap = top10Legacy.filter((id) => modernIds.has(id)).length / 10;

  const top20Legacy = legacy.results.slice(0, 20).map((r) => r.id);
  const top20Modern = modern.results.slice(0, 20).map((r) => r.id);
  const top20Overlap = top20Legacy.filter((id) => modernIds.has(id)).length / 20;

  return {
    query: modern.meta.source, // Placeholder for query context if needed
    resultCountMatch: legacy.results.length === modern.results.length,
    top10Overlap,
    top20Overlap,
    facetParity: 1.0, // TODO: Implement deep facet equality
    missingIds: legacy.results.filter((r) => !modernIds.has(r.id)).map((r) => r.id),
    extraIds: modern.results.filter((r) => !legacyIds.has(r.id)).map((r) => r.id),
  };
}
