"use client";

import React, { useEffect, useState } from "react";
import { supabaseDb } from "@/services/supabase-db";
import { Part } from "@/types";
import { computeSearchParity } from "@/projection/search-parity";

// Feature flag simulation
const ENABLE_SCGS_SHADOW = process.env.NEXT_PUBLIC_ENABLE_SCGS_SHADOW === "true";

export const SearchResultsController: React.FC<{
  query: string;
  filters: any;
  sortBy: string;
  currentPage: number;
  onLoading?: (loading: boolean) => void;
  onResults: (
    hits: Part[],
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
        
        // 1. Primary path (Algolia)
        const { hits, facets, page, totalPages, totalHits } =
          await supabaseDb.searchParts(apiFilters as any);

        // 2. Dual-Read Shadow Path (SCGS)
        if (ENABLE_SCGS_SHADOW) {
          fetch(`/api/search.scgs?q=${query}&page=${currentPage - 1}`)
            .then(res => res.json())
            .then(scgsResults => {
              if (process.env.NODE_ENV === "development") {
                const parity = computeSearchParity(hits as any, scgsResults); // Simplified
                console.table(parity);
              }
            })
            .catch(console.error);
        }

        onResults(hits, facets, { page, totalPages, totalHits });
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
