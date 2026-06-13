import React, { useEffect } from "react";
import {
  useSearchStateMachine,
  SearchInputState,
} from "./hooks/useSearchStateMachine";
import { projectSearchResults } from "./utils/ProjectionEngine";
import { supabaseDb } from "@/services/supabase-db";
import { LiveSearchResults, SearchSuggestion } from "./types/search-types";
import { getRecentSearches } from "./utils/recent-searches";
import { POPULAR_SEARCHES } from "./constants/popular-searches";

interface SearchDropdownControllerProps {
  query: string;
  onResults: (results: LiveSearchResults | null) => void;
  onStateChange?: (state: SearchInputState) => void;
}

export const SearchDropdownController: React.FC<
  SearchDropdownControllerProps
> = ({ query, onResults, onStateChange }) => {
  const { state, transition, startNewRequest, getCurrentVersion } =
    useSearchStateMachine();

  // Notify parent of state changes if needed
  useEffect(() => {
    if (onStateChange) onStateChange(state);
  }, [state, onStateChange]);

  useEffect(() => {
    if (query === "") {
      transition(SearchInputState.FOCUSED);

      const recent = getRecentSearches();
      const popular = POPULAR_SEARCHES.map((label) => ({
        id: `popular-${label}`,
        type: "part_number" as const,
        label,
      }));

      onResults({
        metadata: { totalHits: 0, query: "", generatedAt: Date.now() },
        products: { hits: [], total: 0 },
        vehicles: { hits: [], total: 0 },
        taxonomy: { hits: [], total: 0 },
        manufacturers: { hits: [], total: 0 },
        recent,
        popular,
      } as any);
      return;
    }

    // Special Detection Logic (VIN/Part Number)
    const isVin = query.length === 17;
    const isPartNumber = /^[A-Z0-9-]{5,}$/.test(query);

    transition(SearchInputState.LOADING);
    const { version, signal } = startNewRequest();

    const debounce = globalThis.setTimeout(async () => {
      try {
        const { hits, rawHits, totalHits } = await supabaseDb.searchParts({
          query,
          sortBy: "relevance",
        } as any);

        if (version === getCurrentVersion() && !signal.aborted) {
          console.log("DEBUG: Algolia Hit Example:", (rawHits || hits)[0]);
          const projectedResults = projectSearchResults(
            (rawHits || hits) as Record<string, unknown>[],
            totalHits,
          );
          projectedResults.metadata.query = query;

          // Apply Decorators
          const decoratedResults = {
            ...projectedResults,
            special: [] as SearchSuggestion[],
          };
          if (isVin) {
            decoratedResults.special.push({
              id: "vin-decode",
              type: "vin",
              label: "VIN Detected: Decode Vehicle →",
            });
          } else if (isPartNumber) {
            decoratedResults.special.push({
              id: "pn-match",
              type: "part_number",
              label: "Part Number Match: Search This Part →",
            });
          }

          if (
            projectedResults.products.total === 0 &&
            projectedResults.vehicles.total === 0 &&
            projectedResults.taxonomy.total === 0 &&
            projectedResults.manufacturers.total === 0 &&
            decoratedResults.special.length === 0
          ) {
            transition(SearchInputState.NO_RESULTS);
            onResults(null);
          } else {
            transition(SearchInputState.RESULTS);
            onResults(decoratedResults as any);
          }
        }
      } catch (err) {
        if (!signal.aborted) {
          console.error("Search error:", err);
          transition(SearchInputState.NO_RESULTS);
          onResults(null);
        }
      }
    }, 150);

    return () => globalThis.clearTimeout(debounce);
  }, [query, transition, onResults, startNewRequest, getCurrentVersion]);

  return null;
};

export default SearchDropdownController;
