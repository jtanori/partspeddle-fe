"use client";

import { useEffect, useState } from "react";
import { mapSellerToSeller } from "@/lib/api-mappers";
import { Seller } from "@/types";

interface UseTopSellersOptions {
  limit?: number;
  enabled?: boolean;
}

const IDLE_STATE = {
  sellers: [] as Seller[],
  loading: false,
  error: null as string | null,
};

export function useTopSellers(
  options: UseTopSellersOptions = {},
): { sellers: Seller[]; loading: boolean; error: string | null } {
  const { limit = 4, enabled = true } = options;
  const isActive = enabled;

  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(isActive);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isActive) return;

    let cancelled = false;

    async function fetchSellers() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/sellers/top?limit=${limit}`);
        if (!response.ok) throw new Error("Failed to fetch top sellers");

        const data = await response.json();
        if (!cancelled) {
          setSellers((data || []).map(mapSellerToSeller));
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Seller fetch failed");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchSellers();

    return () => {
      cancelled = true;
    };
  }, [limit, isActive]);

  if (!isActive) {
    return IDLE_STATE;
  }

  return { sellers, loading, error };
}