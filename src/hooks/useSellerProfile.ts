"use client";

import { useEffect, useState } from "react";
import { authenticatedFetch } from "@/lib/authenticated-fetch";

interface UseSellerProfileOptions {
  userId?: string | null;
}

const IDLE_STATE = {
  profile: null as Record<string, unknown> | null,
  loading: false,
  error: null as string | null,
};

export function useSellerProfile(options: UseSellerProfileOptions = {}) {
  const { userId } = options;
  const isActive = Boolean(userId);

  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(isActive);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isActive) return;

    let cancelled = false;

    async function fetchProfile() {
      setLoading(true);
      setError(null);

      try {
        const response = await authenticatedFetch("/api/seller/profile");
        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          throw new Error(body.error || "Failed to fetch seller profile");
        }

        const data = await response.json();
        if (!cancelled) {
          setProfile(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Profile fetch failed",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchProfile();

    return () => {
      cancelled = true;
    };
  }, [userId, isActive]);

  if (!isActive) {
    return IDLE_STATE;
  }

  return { profile, loading, error };
}