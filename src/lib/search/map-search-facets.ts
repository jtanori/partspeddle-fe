import { FacetViewModel } from "@/domain/view-models/search";
import { PartCondition, SearchFilters } from "@/types";

const FACET_LABELS: Record<string, string> = {
  category: "Category",
  part_type: "Part Type",
  make: "Make",
  model: "Model",
  year: "Year",
  condition: "Condition",
  seller_verified: "Verified Sellers",
  location: "Location",
};

function isFacetValueSelected(
  facetKey: string,
  value: string,
  filters: SearchFilters,
): boolean {
  switch (facetKey) {
    case "category":
      return filters.category === value;
    case "part_type":
      return filters.partTypes.includes(value);
    case "make":
      return filters.fitmentMake === value;
    case "model":
      return filters.fitmentModel === value;
    case "year":
      return filters.fitmentYear === value;
    case "condition":
      return filters.conditions.includes(value as PartCondition);
    case "seller_verified":
      return filters.sellerType === "trusted" && value === "true";
    default:
      return false;
  }
}

export function mapAlgoliaFacetsToViewModels(
  facets: Record<string, Record<string, number>> | undefined,
  filters: SearchFilters,
): FacetViewModel[] {
  if (!facets) return [];

  return Object.entries(facets).map(([key, values]) => ({
    key,
    label: FACET_LABELS[key] || key,
    values: Object.entries(values)
      .map(([value, count]) => ({
        value,
        count,
        selected: isFacetValueSelected(key, value, filters),
      }))
      .sort((a, b) => b.count - a.count),
  }));
}