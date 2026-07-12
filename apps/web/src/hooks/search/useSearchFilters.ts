import { useState, useEffect } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { SearchFilters } from "@/types";
import { SYSTEMS_LIST } from "@/components/search/constants";
import { serializeFilters } from "@/components/search/utils/url-utils";
import { SearchAnalyticsService } from "@/services/SearchAnalyticsService";

export const useSearchFilters = (
  initialSearchText: string,
  initialCategory: string,
) => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const [filters, setFilters] = useState<SearchFilters>({
    query: initialSearchText,
    system:
      initialCategory !== "All Parts" && SYSTEMS_LIST.includes(initialCategory)
        ? initialCategory
        : "",
    category:
      initialCategory !== "All Parts" && !SYSTEMS_LIST.includes(initialCategory)
        ? initialCategory
        : "",
    partTypes: [],
    priceRange: [0, 500],
    conditions: [],
    sellerType: "all",
    fitmentMake: "All Makes",
    fitmentModel: "All Models",
    fitmentYear: "All Years",
    fitmentEngine: "All Engines",
    featured: false,
  });

  // URL sync on mount
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFilters((prev) => {
      const updated = { ...prev };
      const system = searchParams.get("system");
      if (system) updated.system = system;
      const q = searchParams.get("q");
      if (q) updated.query = q;
      const sort = searchParams.get("sort");
      if (sort === "price_asc" || sort === "price_desc" || sort === "newest")
        updated.sortBy = sort;
      const view = searchParams.get("view");
      if (view === "grid" || view === "list") {
        updated.viewMode = view;
        localStorage.setItem("searchViewMode", view);
      } else {
        const storedView = localStorage.getItem("searchViewMode");
        if (storedView === "grid" || storedView === "list")
          updated.viewMode = storedView;
      }
      return updated;
    });
  }, [searchParams]);

  const setAndSyncFilters = (
    updateFn: SearchFilters | ((prev: SearchFilters) => SearchFilters),
  ) => {
    setFilters((prev) => {
      const next = typeof updateFn === "function" ? updateFn(prev) : updateFn;

      // Persist viewMode to localStorage if changed
      if (next.viewMode && next.viewMode !== prev.viewMode) {
        localStorage.setItem("searchViewMode", next.viewMode);
      }

      // Instrument FILTER_APPLIED
      Object.keys(next).forEach((key) => {
        if (
          JSON.stringify(prev[key as keyof SearchFilters]) !==
          JSON.stringify(next[key as keyof SearchFilters])
        ) {
          SearchAnalyticsService.logFilterApplied(
            key,
            next[key as keyof SearchFilters],
          );
        }
      });

      router.replace(`${pathname}?${serializeFilters(next)}`);
      return next;
    });
  };

  const clearAllFilters = () => {
    setAndSyncFilters({
      query: "",
      system: "",
      category: "",
      partTypes: [],
      priceRange: [0, 500],
      conditions: [],
      sellerType: "all",
      fitmentMake: "All Makes",
      fitmentModel: "All Models",
      fitmentYear: "All Years",
      fitmentEngine: "All Engines",
      featured: false,
    });
  };

  return { filters, setAndSyncFilters, clearAllFilters };
};
