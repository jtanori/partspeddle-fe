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

const IDLE_STATE: InstantSearchState = {
  parts: [],
  loading: false,
  error: null,
};

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

  const trimmed = query.trim();
  const isActive =
    enabled && (trimmed.length >= minLength || Boolean(system));

  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isActive) return;

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
  }, [trimmed, minLength, limit, system, enabled, debounceMs, isActive]);

  if (!isActive) {
    return IDLE_STATE;
  }

  return { parts, loading, error };
}