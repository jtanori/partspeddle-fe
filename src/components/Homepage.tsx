import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { HighFidelityHero } from "./homepage/HighFidelityHero";
import { TrustBar } from "./homepage/TrustBar";
import { ListingsGrid } from "./homepage/ListingsGrid";
import { FeaturedSellers } from "./homepage/FeaturedSellers";
import { FinalCTA } from "./homepage/FinalCTA";
import { supabaseDb } from "../services/supabase-db";
import { Part, Seller } from "../types";

export default function Homepage() {
  const router = useRouter();
  const [featuredListings, setFeaturedListings] = useState<Part[]>([]);
  const [recentParts, setRecentParts] = useState<Part[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [featured, recent, topSellers] = await Promise.all([
          supabaseDb.getFeaturedParts(8),
          supabaseDb.getFeaturedParts(4),
          supabaseDb.getTopSellers(4),
        ]);
        setFeaturedListings(featured || []);
        setRecentParts(recent || []);
        setSellers(topSellers || []);
      } catch (err) {
        console.error("Error fetching home page data:", err);
      }
    };
    fetchHomeData();
  }, []);

  const handleViewAllParts = () => router.push("/search");
  const handleViewAllSellers = () => router.push("/search");

  return (
    <div className="flex flex-col">
      <HighFidelityHero />
      <TrustBar />

      <ListingsGrid
        title="Recently Added Listings"
        subtitle="Fresh inventory just hit the floor"
        parts={recentParts}
        onViewAll={handleViewAllParts}
      />

      <ListingsGrid
        title="Featured Parts Index"
        subtitle="Inspected listings from our highest rated sellers"
        parts={featuredListings}
        onViewAll={handleViewAllParts}
      />

      <FeaturedSellers sellers={sellers} onViewAll={handleViewAllSellers} />
      <FinalCTA />
    </div>
  );
}
