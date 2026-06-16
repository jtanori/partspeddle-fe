"use client";

import React, { useEffect, useState } from "react";
import { supabaseDb } from "@/services/supabase-db";
import { Part } from "@/types";
import { buildSearchResultCard } from "@/projection/search";
import { SearchResultCardModel } from "@/domain/view-models/search";

export const SearchResultsController: React.FC<{
  query: string;
  filters: any;
  sortBy: string;
  currentPage: number;
  onLoading?: (loading: boolean) => void;
  onResults: (
    cards: SearchResultCardModel[],
    facets: any,
    meta: { totalPages: number; page: number; totalHits: number },
  ) => void;
}> = ({ query, filters, sortBy, currentPage, onLoading, onResults }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (onLoading) onLoading(loading);
  }, [loading, onLoading]);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      setError(null);
      try {
        const apiFilters = {
          ...filters,
          query,
          sortBy,
          page: currentPage - 1, // Algolia is 0-indexed
        };
        
        const { hits, facets, page, totalPages, totalHits } =
          await supabaseDb.searchParts(apiFilters as any);

        // Project to SearchViewModel contract
        const cardModels = (hits as Part[]).map(buildSearchResultCard);
        
        onResults(cardModels, facets, { page, totalPages, totalHits });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query, filters, sortBy, currentPage]);

  if (loading) return <div className="p-8 text-center">Buscando partes...</div>;
  if (error)
    return <div className="p-8 text-center text-red-500">Error: {error}</div>;

  return null;
};

export default SearchResultsController;
