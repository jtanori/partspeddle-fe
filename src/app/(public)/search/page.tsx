"use client";

import React, { useState, Suspense, useMemo } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { SearchResultsController } from "@/components/search/SearchResultsController";
import { ProductSidebar } from "@/components/ProductSidebar";
import { SearchResultsHeader } from "@/components/search/SearchResultsHeader";
import { ViewToggle } from "@/components/search/ViewToggle";
import SortDropdown from "@/components/search/SortDropdown";
import { GridResultsView } from "@/components/search/GridResultsView";
import { ListResultsView } from "@/components/search/ListResultsView";
import { SearchNoResults } from "@/components/search/SearchNoResults";
import { Pagination } from "@/components/search/Pagination";
import { PartCondition, SearchFilters } from "@/types";
import { SearchResultCardModel } from "@/domain/view-models/search";

function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const query = searchParams.get("q") || "";
  const view = (searchParams.get("view") as "grid" | "list") || "grid";
  const sortBy = searchParams.get("sort") || "newest";

  const [cards, setCards] = useState<SearchResultCardModel[]>([]);
  const [facets, setFacets] = useState<any>({});
  const [pagination, setPagination] = useState({
    totalPages: 1,
    currentPage: 1,
    totalHits: 0,
  });
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Derive filters from URL
  const filters: SearchFilters = useMemo(
    () => ({
      query: searchParams.get("q") || "",
      system: searchParams.get("system") || "",
      category: searchParams.get("category") || "",
      partTypes: searchParams.getAll("partType"),
      fitmentMake: searchParams.get("fitmentMake") || "All Makes",
      fitmentModel: searchParams.get("fitmentModel") || "All Models",
      fitmentYear: searchParams.get("fitmentYear") || "All Years",
      fitmentEngine: searchParams.get("fitmentEngine") || "All Engines",
      featured: searchParams.get("featured") === "true",
      priceRange: [
        parseInt(searchParams.get("minPrice") || "0"),
        parseInt(searchParams.get("maxPrice") || "10000"),
      ],
      conditions: searchParams.getAll("condition") as PartCondition[],
      sellerType: (searchParams.get("sellerType") as any) || "all",
    }),
    [searchParams],
  );

  const [collapsedSections, setCollapsedSections] = useState<
    Record<string, boolean>
  >({
    search: true,
    category: true,
    partType: true,
    fitment: true,
    price: true,
    condition: true,
    seller: true,
    sort: true,
  });

  const handleResults = (
    newCards: SearchResultCardModel[],
    newFacets: any,
    meta: { totalPages: number; page: number; totalHits: number },
  ) => {
    setCards(newCards);
    setFacets(newFacets);
    setPagination({
      totalPages: meta.totalPages,
      currentPage: meta.page + 1,
      totalHits: meta.totalHits,
    });
  };

  const toggleFavorite = (partId: string) => {
    setFavorites((prev) =>
      prev.includes(partId)
        ? prev.filter((id) => id !== partId)
        : [...prev, partId],
    );
  };

  const setView = (newView: "grid" | "list") => {
    const params = new globalThis.URLSearchParams(searchParams.toString());
    params.set("view", newView);
    router.replace(`${pathname}?${params.toString()}`);
  };

  const onSelectPart = (partId: string) => router.push(`/listing/${partId}`);

  // Helper functions required by ProductSidebar
  const toggleSection = (sec: string) => {
    setCollapsedSections((prev) => ({ ...prev, [sec]: !prev[sec] }));
  };

  const syncFiltersToUrl = (newFilters: SearchFilters) => {
    const params = new globalThis.URLSearchParams();
    if (newFilters.query) params.set("q", newFilters.query);
    if (newFilters.system) params.set("system", newFilters.system);
    if (newFilters.category) params.set("category", newFilters.category);
    newFilters.partTypes.forEach((t) => params.append("partType", t));
    if (newFilters.fitmentMake !== "All Makes")
      params.set("fitmentMake", newFilters.fitmentMake);
    if (newFilters.fitmentModel !== "All Models")
      params.set("fitmentModel", newFilters.fitmentModel);
    if (newFilters.fitmentYear !== "All Years")
      params.set("fitmentYear", newFilters.fitmentYear);
    if (newFilters.fitmentEngine !== "All Engines")
      params.set("fitmentEngine", newFilters.fitmentEngine);
    if (newFilters.featured) params.set("featured", "true");
    if (newFilters.priceRange[0] > 0)
      params.set("minPrice", newFilters.priceRange[0].toString());
    if (newFilters.priceRange[1] < 10000)
      params.set("maxPrice", newFilters.priceRange[1].toString());
    newFilters.conditions.forEach((c) => params.append("condition", c));
    if (newFilters.sellerType !== "all")
      params.set("sellerType", newFilters.sellerType);

    // Preserve view and sort
    if (view !== "grid") params.set("view", view);
    if (sortBy !== "newest") params.set("sort", sortBy);

    router.replace(`${pathname}?${params.toString()}`);
  };

  const clearAllFilters = () => {
    router.replace(pathname);
  };

  const togglePartType = (type: string) => {
    const newPartTypes = filters.partTypes.includes(type)
      ? filters.partTypes.filter((t) => t !== type)
      : [...filters.partTypes, type];
    syncFiltersToUrl({ ...filters, partTypes: newPartTypes });
  };

  const toggleCondition = (cond: PartCondition) => {
    const newConditions = filters.conditions.includes(cond)
      ? filters.conditions.filter((c) => c !== cond)
      : [...filters.conditions, cond];
    syncFiltersToUrl({ ...filters, conditions: newConditions });
  };

  const handlePriceChange = (index: number, val: number) => {
    const newRange = [...filters.priceRange];
    newRange[index] = val;
    syncFiltersToUrl({ ...filters, priceRange: newRange as [number, number] });
  };

  const setAndSyncFilters = (
    updateFn: (prev: SearchFilters) => SearchFilters,
  ) => {
    const newFilters = updateFn(filters);
    syncFiltersToUrl(newFilters);
  };

  return (
    <div className="container mx-auto px-4 py-8 flex gap-8">
      <aside className="w-[280px] hidden md:block">
        <ProductSidebar
          filters={filters}
          facets={facets}
          clearAllFilters={clearAllFilters}
          toggleSection={toggleSection}
          collapsedSections={collapsedSections}
          sortBy={sortBy}
          setSortBy={(val) => {
            const params = new globalThis.URLSearchParams(
              searchParams.toString(),
            );
            params.set("sort", val);
            router.replace(`${pathname}?${params.toString()}`);
          }}
          getSystemPartCount={() => "0"}
          getConditionCount={() => 0}
          getSellerTypeCount={() => 0}
          togglePartType={togglePartType}
          toggleCondition={toggleCondition}
          handlePriceChange={handlePriceChange}
          setAndSyncFilters={setAndSyncFilters}
          isDisabled={cards.length === 0 && query !== ""}
        />
      </aside>

      <main className="flex-1">
        <div className="flex justify-between items-center mb-6">
          <SearchResultsHeader
            filters={filters}
            totalCount={pagination.totalHits}
            isLoading={isLoading}
          />
          <div className="flex gap-4">
            <SortDropdown
              value={sortBy}
              onChange={(value) => {
                const params = new globalThis.URLSearchParams(
                  searchParams.toString(),
                );
                params.set("sort", value);
                router.replace(`${pathname}?${params.toString()}`);
              }}
            />
            <ViewToggle currentView={view} onViewChange={setView} />
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-zinc-500">Searching...</div>
        ) : cards.length === 0 ? (
          <SearchNoResults onClearSearch={() => router.replace(pathname)} />
        ) : (
          <>
            {view === "grid" ? (
              <GridResultsView
                cards={cards}
                favorites={favorites}
                toggleFavorite={toggleFavorite}
                onSelectPart={onSelectPart}
              />
            ) : (
              <ListResultsView
                cards={cards}
                favorites={favorites}
                toggleFavorite={toggleFavorite}
                onSelectPart={onSelectPart}
              />
            )}
            <div className="pt-8">
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={(page) => {
                  const params = new globalThis.URLSearchParams(
                    searchParams.toString(),
                  );
                  params.set("page", page.toString());
                  router.replace(`${pathname}?${params.toString()}`);
                }}
              />
            </div>
          </>
        )}

        <SearchResultsController
          query={query}
          filters={filters}
          sortBy={sortBy}
          currentPage={Number(searchParams.get("page") || 1)}
          onLoading={setIsLoading}
          onResults={handleResults}
        />
      </main>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Cargando...</div>}>
      <SearchPageContent />
    </Suspense>
  );
}
