"use client";

import { useEffect, useState } from "react";
import { Taxonomy } from "@/lib/taxonomy";

interface UseTaxonomyResult {
  taxonomy: Taxonomy | null;
  loading: boolean;
  error: Error | null;
}

export function useTaxonomy(): UseTaxonomyResult {
  const [taxonomy, setTaxonomy] = useState<Taxonomy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchTaxonomy() {
      try {
        const response = await fetch("/api/taxonomy");
        if (!response.ok) {
          throw new Error("Failed to fetch taxonomy");
        }

        const data = await response.json();
        if (!cancelled) {
          setTaxonomy(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchTaxonomy();

    return () => {
      cancelled = true;
    };
  }, []);

  return { taxonomy, loading, error };
}