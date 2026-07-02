import React, { useEffect } from "react";
import {
  useSearchStateMachine,
  SearchInputState,
} from "./hooks/useSearchStateMachine";
import { projectSearchResults } from "./utils/ProjectionEngine";
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

    // Special Detection Logic (VIN/Part Number/Vehicle)
    const isVin = query.length === 17;
    const isPartNumber = /^[A-Z0-9-]{5,}$/.test(query);
    // Rough pattern for Make/Model/Year, e.g., "Toyota Corolla 2020"
    const isVehicleCombo = /^[A-Z][a-z]+ [A-Z][a-z]+ \d{4}$/.test(query);

    // Don't search if query is too short
    if (query.length < 2 && !isVin && !isPartNumber && !isVehicleCombo) {
      transition(SearchInputState.FOCUSED);
      onResults(null);
      return;
    }

    transition(SearchInputState.LOADING);
    const { version, signal } = startNewRequest();

    const emptyResults: LiveSearchResults = {
      metadata: { totalHits: 0, query: query, generatedAt: Date.now() },
      products: { hits: [], total: 0 },
      vehicles: { hits: [], total: 0 },
      taxonomy: { hits: [], total: 0 },
      manufacturers: { hits: [], total: 0 },
    };

    const debounce = globalThis.setTimeout(async () => {
      try {
        const response = await fetch("/api/search/parts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query, sortBy: "relevance" }),
          signal,
        });

        if (!response.ok) {
          throw new Error("Search request failed");
        }

        const data = await response.json();

        if (version === getCurrentVersion() && !signal.aborted) {
          const projectedResults = projectSearchResults(
            (data.hits || []) as Record<string, unknown>[],
            data.totalHits || 0,
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
          } else if (isVehicleCombo) {
            decoratedResults.special.push({
              id: "vehicle-match",
              type: "vehicle",
              label: `Vehicle Match: See parts for "${query}" →`,
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
            onResults(emptyResults);
          } else {
            transition(SearchInputState.RESULTS);
            onResults(decoratedResults as any);
          }
        }
      } catch (err) {
        if (!signal.aborted) {
          console.error("Search error:", err);
          transition(SearchInputState.NO_RESULTS);
          onResults(emptyResults);
        }
      }
    }, 150);

    return () => globalThis.clearTimeout(debounce);
  }, [query, transition, onResults, startNewRequest, getCurrentVersion]);

  return null;
};

export default SearchDropdownController;
