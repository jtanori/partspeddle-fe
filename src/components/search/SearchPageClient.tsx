"use client";

import React, { useState, useMemo } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { SearchResultsController } from "@/components/search/SearchResultsController";
import { ProductSidebar } from "@/components/ProductSidebar";
import { MobileFilterSheet } from "@/components/search/MobileFilterSheet";
import { SearchResultsHeader } from "@/components/search/SearchResultsHeader";
import { ViewToggle } from "@/components/search/ViewToggle";
import SortDropdown from "@/components/search/SortDropdown";
import { GridResultsView } from "@/components/search/GridResultsView";
import { ListResultsView } from "@/components/search/ListResultsView";
import { SearchNoResults } from "@/components/search/SearchNoResults";
import { Pagination } from "@/components/search/Pagination";
import { InlineLoadingIndicator } from "@/components/common/InlineLoadingIndicator";
import { PartCondition, SearchFilters } from "@/types";
import { SearchResultCardModel } from "@/domain/view-models/search";
import {
  parseSearchParams,
  serializeSearchRequest,
} from "@/lib/search/parse-search-params";

export interface SearchPageInitialData {
  cards: SearchResultCardModel[];
  facets: Record<string, unknown>;
  pagination: {
    totalPages: number;
    currentPage: number;
    totalHits: number;
  };
  requestKey: string;
}

interface SearchPageClientProps {
  initialData: SearchPageInitialData;
}

export function SearchPageClient({ initialData }: SearchPageClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const parsedRequest = useMemo(() => {
    const params: Record<string, string | string[] | undefined> = {};
    searchParams.forEach((value, key) => {
      const existing = params[key];
      if (existing === undefined) {
        params[key] = value;
      } else if (Array.isArray(existing)) {
        existing.push(value);
      } else {
        params[key] = [existing, value];
      }
    });
    return parseSearchParams(params);
  }, [searchParams]);

  const requestKey = serializeSearchRequest(parsedRequest);
  const isInitialRequest = requestKey === initialData.requestKey;

  const { query, sortBy, view, filters } = parsedRequest;
  const currentPage = parsedRequest.page;

  const [cards, setCards] = useState<SearchResultCardModel[]>(initialData.cards);
  const [facets, setFacets] = useState<Record<string, unknown>>(initialData.facets);
  const [pagination, setPagination] = useState(initialData.pagination);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(!isInitialRequest);
  const [searchError, setSearchError] = useState<string | null>(null);

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
    newFacets: Record<string, unknown>,
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

  const toggleSection = (sec: string) => {
    setCollapsedSections((prev) => ({ ...prev, [sec]: !prev[sec] }));
  };

  const syncFiltersToUrl = (newFilters: SearchFilters) => {
    const params = new globalThis.URLSearchParams();
    if (newFilters.query) params.set("q", newFilters.query);
    if (newFilters.system) params.set("system", newFilters.system);
    if (newFilters.category) params.set("category", newFilters.category);
    newFilters.partTypes.forEach((t) => params.append("partType", t));
    if (newFilters.fitmentMake && newFilters.fitmentMake !== "All Makes")
      params.set("fitmentMake", newFilters.fitmentMake);
    if (newFilters.fitmentModel && newFilters.fitmentModel !== "All Models")
      params.set("fitmentModel", newFilters.fitmentModel);
    if (newFilters.fitmentYear && newFilters.fitmentYear !== "All Years")
      params.set("fitmentYear", newFilters.fitmentYear);
    if (newFilters.fitmentEngine && newFilters.fitmentEngine !== "All Engines")
      params.set("fitmentEngine", newFilters.fitmentEngine);
    if (newFilters.featured) params.set("featured", "true");
    if (newFilters.priceRange[0] > 0)
      params.set("minPrice", newFilters.priceRange[0].toString());
    if (newFilters.priceRange[1] < 10000)
      params.set("maxPrice", newFilters.priceRange[1].toString());
    newFilters.conditions.forEach((c) => params.append("condition", c));
    if (newFilters.sellerType !== "all")
      params.set("sellerType", newFilters.sellerType);

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
    updateFn: SearchFilters | ((prev: SearchFilters) => SearchFilters),
  ) => {
    const newFilters =
      typeof updateFn === "function" ? updateFn(filters) : updateFn;
    syncFiltersToUrl(newFilters);
  };

  const sidebarProps = {
    filters,
    facets,
    clearAllFilters,
    toggleSection,
    collapsedSections,
    sortBy,
    setSortBy: (val: string) => {
      const params = new globalThis.URLSearchParams(searchParams.toString());
      params.set("sort", val);
      router.replace(`${pathname}?${params.toString()}`);
    },
    getSystemPartCount: () => "0" as string,
    getConditionCount: () => 0,
    getSellerTypeCount: () => 0,
    togglePartType,
    toggleCondition,
    handlePriceChange,
    setAndSyncFilters,
    isDisabled: cards.length === 0 && query !== "",
  };

  return (
    <div className="mx-auto max-w-7xl w-full px-4 py-8">
      <div className="flex gap-8">
        <aside
          className="w-[280px] shrink-0 hidden md:block"
          aria-label="Search filters"
        >
          <ProductSidebar {...sidebarProps} />
        </aside>

        <section className="flex-1 min-w-0" aria-label="Search results">
        <div className="md:hidden mb-4">
          <MobileFilterSheet {...sidebarProps} />
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
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

        {searchError ? (
          <div className="py-8 text-center text-red-600" role="alert">
            Error: {searchError}
          </div>
        ) : isLoading ? (
          <InlineLoadingIndicator />
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
          currentPage={currentPage}
          requestKey={requestKey}
          skipInitialFetch={isInitialRequest}
          onLoading={setIsLoading}
          onError={setSearchError}
          onResults={handleResults}
        />
        </section>
      </div>
    </div>
  );
}