import { LiveSearchResults, SearchSuggestion } from "../types/search-types";

export const projectSearchResults = (
  hits: Record<string, unknown>[],
  totalHits: number = 0,
): LiveSearchResults => {
  const now = Date.now();

  // 1. Products (Top 5)
  const products: SearchSuggestion[] = hits.slice(0, 5).map((hit) => ({
    id: hit.objectID as string,
    type: "product",
    label: hit.title as string,
    metadata: {
      price: hit.price,
      subtitle: `${hit.year} ${hit.make} ${hit.model}`,
      imageUrl: hit.image_url,
    },
  }));

  // 2. Vehicles (Deduplicated, Top 5)
  const vehicleMap = new Map<string, string>();
  hits.forEach((hit) => {
    if (hit.year && hit.make && hit.model) {
      const v = `${hit.year} ${hit.make} ${hit.model}`;
      vehicleMap.set(
        v,
        `fitmentYear=${hit.year}&fitmentMake=${hit.make}&fitmentModel=${hit.model}`,
      );
    }
  });
  const allVehicles: SearchSuggestion[] = Array.from(vehicleMap.entries()).map(
    ([label, metadata]) => ({
      id: label,
      type: "vehicle",
      label,
      metadata,
    }),
  );
  const vehicles = allVehicles.slice(0, 5);

  // 3. Taxonomy (Systems & Part Types)
  const taxonomyMap = new Map<
    string,
    { type: "system" | "part_type"; label: string }
  >();
  hits.forEach((hit) => {
    if (typeof hit.system === "string") {
      taxonomyMap.set(`system-${hit.system}`, {
        type: "system",
        label: hit.system,
      });
    }
    if (typeof hit.part_type === "string") {
      taxonomyMap.set(`part_type-${hit.part_type}`, {
        type: "part_type",
        label: hit.part_type,
      });
    }
  });
  const allTaxonomy: SearchSuggestion[] = Array.from(taxonomyMap.entries()).map(
    ([id, data]) => ({
      id,
      type: data.type,
      label: data.label,
    }),
  );
  const taxonomy = allTaxonomy.slice(0, 5);

  // 4. Manufacturers (Deduplicated, Top 5)
  const manufacturerMap = new Map<string, string>();
  hits.forEach((hit) => {
    if (typeof hit.make === "string") {
      manufacturerMap.set(hit.make, hit.make);
    }
  });
  const allManufacturers: SearchSuggestion[] = Array.from(
    manufacturerMap.entries(),
  ).map(([id, label]) => ({
    id: `manufacturer-${id}`,
    type: "manufacturer",
    label,
  }));
  const manufacturers = allManufacturers.slice(0, 5);

  return {
    metadata: {
      totalHits: hits.length,
      query: "",
      generatedAt: now,
    },
    products: { hits: products, total: Math.min(hits.length, 50) }, // Products total is basically hits total
    vehicles: { hits: vehicles, total: allVehicles.length },
    taxonomy: { hits: taxonomy, total: allTaxonomy.length },
    manufacturers: { hits: manufacturers, total: allManufacturers.length },
  };
};
