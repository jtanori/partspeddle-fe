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
  onError?: (error: string | null) => void;
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
  onError,
  onResults,
}) => {
  const [loading, setLoading] = useState(false);
  const skippedInitialRef = useRef(skipInitialFetch);

  useEffect(() => {
    onLoading?.(loading);
  }, [loading, onLoading]);

  useEffect(() => {
    onError?.(null);
  }, [requestKey, onError]);

  useEffect(() => {
    if (skippedInitialRef.current) {
      skippedInitialRef.current = false;
      return;
    }

    const controller = new AbortController();

    const fetchResults = async () => {
      setLoading(true);
      onError?.(null);
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
        onError?.(err instanceof Error ? err.message : "Search failed");
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchResults();

    return () => controller.abort();
  }, [requestKey]);

  return null;
};

export default SearchResultsController;