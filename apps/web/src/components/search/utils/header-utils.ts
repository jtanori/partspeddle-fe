import { SearchFilters } from "@/types";

export const composeSearchHeader = (
  filters: SearchFilters,
  totalCount: number,
  isLoading: boolean,
): { title: string; subtitle: string } => {
  const { query, system, category, sortBy } = filters;

  // Compose Title
  let title = isLoading ? "SEARCHING..." : "FULL PARTS CATALOG";
  if (query && !isLoading) {
    title = `SHOWING RESULTS FOR "${query.toUpperCase()}"`;
  } else if ((system || category) && !isLoading) {
    title = `SHOWING RESULTS FOR ${system || category}`;
  }

  // Compose Subtitle
  let subtitle = isLoading
    ? "Please wait while we fetch your results..."
    : `Viewing ${totalCount} parts`;

  if (!isLoading) {
    let subtitleParts = [`Viewing ${totalCount} parts`];

    if (sortBy) {
      // ... (existing sorting logic)
      const sortLabels: Record<string, string> = {
        price_asc: "Price (Low to High)",
        price_desc: "Price (High to Low)",
        newest: "Newest Arrivals",
      };
      subtitleParts.push(`Sorted by ${sortLabels[sortBy] || sortBy}`);
    }

    // ... (rest of filtering logic)
    const activeFilters = [];
    if (filters.system) activeFilters.push(filters.system);
    if (filters.category) activeFilters.push(filters.category);
    if (filters.conditions?.length)
      activeFilters.push(`${filters.conditions.length} conditions`);
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 10000)
      activeFilters.push(
        `Price: $${filters.priceRange[0]}-$${filters.priceRange[1]}`,
      );

    if (activeFilters.length > 0) {
      subtitleParts.push(`Filtered by ${activeFilters.join(", ")}`);
    }
    subtitle = subtitleParts.join(" • ");
  }

  return { title, subtitle };
};
