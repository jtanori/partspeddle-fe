"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { HighFidelityHero } from "./homepage/HighFidelityHero";
import { TrustBar } from "./homepage/TrustBar";
import { ListingsGrid } from "./homepage/ListingsGrid";
import { FeaturedSellers } from "./homepage/FeaturedSellers";
import { FinalCTA } from "./homepage/FinalCTA";
import { useHomepageData } from "@/hooks/useHomepageData";

export default function Homepage() {
  const router = useRouter();
  const { featuredListings, recentParts, sellers } = useHomepageData();

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