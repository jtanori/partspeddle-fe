"use client";

import { useEffect, useState } from "react";
import { mapPartToPart, mapSellerToSeller } from "@/lib/api-mappers";
import { Part, Seller } from "@/types";

interface HomepageData {
  featuredListings: Part[];
  recentParts: Part[];
  sellers: Seller[];
  loading: boolean;
  error: string | null;
}

export function useHomepageData(): HomepageData {
  const [featuredListings, setFeaturedListings] = useState<Part[]>([]);
  const [recentParts, setRecentParts] = useState<Part[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchHomeData() {
      setLoading(true);
      setError(null);

      try {
        const [featuredRes, recentRes, sellersRes] = await Promise.all([
          fetch("/api/parts/featured?limit=8"),
          fetch("/api/parts/featured?limit=4"),
          fetch("/api/sellers/top?limit=4"),
        ]);

        if (!featuredRes.ok || !recentRes.ok || !sellersRes.ok) {
          throw new Error("Failed to fetch homepage data");
        }

        const [featuredData, recentData, sellersData] = await Promise.all([
          featuredRes.json(),
          recentRes.json(),
          sellersRes.json(),
        ]);

        if (!cancelled) {
          setFeaturedListings((featuredData || []).map(mapPartToPart));
          setRecentParts((recentData || []).map(mapPartToPart));
          setSellers((sellersData || []).map(mapSellerToSeller));
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Homepage fetch failed");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchHomeData();

    return () => {
      cancelled = true;
    };
  }, []);

  return { featuredListings, recentParts, sellers, loading, error };
}