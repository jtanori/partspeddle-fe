"use client";

import { useEffect, useState } from "react";
import { Part } from "@/types";
import { mapSearchHitToPart } from "@/lib/search-hit-mapper";

interface UseInstantSearchOptions {
  minLength?: number;
  limit?: number;
  system?: string;
  enabled?: boolean;
  debounceMs?: number;
}

interface InstantSearchState {
  parts: Part[];
  loading: boolean;
  error: string | null;
}

export function useInstantSearch(
  query: string,
  options: UseInstantSearchOptions = {},
): InstantSearchState {
  const {
    minLength = 2,
    limit = 10,
    system = "",
    enabled = true,
    debounceMs = 300,
  } = options;

  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setParts([]);
      setLoading(false);
      setError(null);
      return;
    }

    const trimmed = query.trim();
    if (trimmed.length < minLength && !system) {
      setParts([]);
      setLoading(false);
      setError(null);
      return;
    }

    const controller = new AbortController();

    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/search/parts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: trimmed,
            hitsPerPage: limit,
            page: 0,
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Instant search request failed");
        }

        const data = await response.json();
        const mapped = (data.hits ?? []).map((hit: Record<string, unknown>) =>
          mapSearchHitToPart(hit),
        );

        const filtered = system
          ? mapped.filter(
              (part: Part) =>
                part.system?.toLowerCase() === system.toLowerCase(),
            )
          : mapped;

        setParts(filtered);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          return;
        }
        setParts([]);
        setError(err instanceof Error ? err.message : "Search failed");
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }, debounceMs);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query, minLength, limit, system, enabled, debounceMs]);

  return { parts, loading, error };
}