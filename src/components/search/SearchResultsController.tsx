"use client";

import React, { useEffect, useRef, useState } from "react";
import { buildSearchResultCard } from "@/projection/search";
import { SearchResultCardModel } from "@/domain/view-models/search";
import { SearchFilters } from "@/types";

export const SearchResultsController: React.FC<{
  query: string;
  filters: SearchFilters;
  sortBy: string;
  currentPage: number;
  requestKey: string;
  skipInitialFetch?: boolean;
  onLoading?: (loading: boolean) => void;
  onResults: (
    cards: SearchResultCardModel[],
    facets: Record<string, unknown>,
    meta: { totalPages: number; page: number; totalHits: number },
  ) => void;
}> = ({
  query,
  filters,
  sortBy,
  currentPage,
  requestKey,
  skipInitialFetch = false,
  onLoading,
  onResults,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const skippedInitialRef = useRef(skipInitialFetch);

  useEffect(() => {
    if (onLoading) onLoading(loading);
  }, [loading, onLoading]);

  useEffect(() => {
    if (skippedInitialRef.current) {
      skippedInitialRef.current = false;
      return;
    }

    const controller = new AbortController();

    const fetchResults = async () => {
      setLoading(true);
      setError(null);
      try {
        const apiFilters = {
          ...filters,
          query,
          sortBy,
          page: currentPage - 1,
        };

        const response = await fetch("/api/search/parts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(apiFilters),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Failed to search parts");
        }

        const data = await response.json();
        const cardModels = (data.hits ?? []).map((hit: Record<string, unknown>) =>
          buildSearchResultCard(hit),
        );

        onResults(cardModels, data.facets || {}, {
          page: data.page ?? 0,
          totalPages: data.totalPages ?? 1,
          totalHits: data.totalHits ?? 0,
        });
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === "AbortError") {
          return;
        }
        setError(err instanceof Error ? err.message : "Search failed");
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchResults();

    return () => controller.abort();
  }, [requestKey]);

  if (loading) return <div className="p-8 text-center">Buscando partes...</div>;
  if (error)
    return <div className="p-8 text-center text-red-500">Error: {error}</div>;

  return null;
};

export default SearchResultsController;