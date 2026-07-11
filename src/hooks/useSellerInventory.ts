"use client";

import { useEffect, useState } from "react";
import { authenticatedFetch } from "@/lib/authenticated-fetch";

interface InventoryItem {
  id: string;
  title: string;
  price_mxn: number;
  stock_number?: string;
  images?: string[];
  status: string;
  views?: number;
}

interface UseSellerInventoryOptions {
  userId?: string | null;
  filter?: "active" | "sold" | "archived";
}

const IDLE_STATE = {
  parts: [] as InventoryItem[],
  loading: false,
  error: null as string | null,
};

export function useSellerInventory(options: UseSellerInventoryOptions = {}) {
  const { userId, filter } = options;
  const isActive = Boolean(userId);

  const [parts, setParts] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(isActive);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isActive) return;

    let cancelled = false;

    async function loadInventory() {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        if (filter) params.set("filter", filter);

        const response = await authenticatedFetch(
          `/api/seller/inventory?${params.toString()}`,
        );

        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          throw new Error(body.error || "Failed to load inventory");
        }

        const data = await response.json();
        if (!cancelled) {
          setParts(data || []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Inventory fetch failed",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadInventory();

    return () => {
      cancelled = true;
    };
  }, [userId, filter, isActive]);

  if (!isActive) {
    return IDLE_STATE;
  }

  return { parts, loading, error };
}