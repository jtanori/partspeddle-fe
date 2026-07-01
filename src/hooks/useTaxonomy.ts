"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { buildTaxonomy, Taxonomy } from "@/lib/taxonomy";

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
        const [{ data: categories, error: categoriesError }, { data: partTypes, error: partTypesError }] =
          await Promise.all([
            supabase.from("categories").select("id, slug, slug_en, name, name_en, name_es, icon"),
            supabase.from("part_types").select("id, category_id, slug, slug_en, name, name_en, name_es"),
          ]);

        if (categoriesError) throw categoriesError;
        if (partTypesError) throw partTypesError;

        if (!cancelled) {
          setTaxonomy(buildTaxonomy(categories || [], partTypes || []));
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
