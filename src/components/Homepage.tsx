'use client';

import React from 'react';
import { HighFidelityHero } from './homepage/HighFidelityHero';
import { TrustBar } from './homepage/TrustBar';
import { ListingsGrid } from './homepage/ListingsGrid';
import { FeaturedSellers } from './homepage/FeaturedSellers';
import { FinalCTA } from './homepage/FinalCTA';
import { useHomepageData } from '@/hooks/useHomepageData';

export default function Homepage() {
  const { featuredListings, recentParts, sellers } = useHomepageData();

  return (
    <div className="flex flex-col">
      <HighFidelityHero />
      <TrustBar />

      <ListingsGrid
        title="Recently Added Listings"
        subtitle="Fresh inventory just hit the floor"
        parts={recentParts}
        viewAllHref="/search"
        emptyActionHref="/search"
      />

      <ListingsGrid
        title="Featured Parts Index"
        subtitle="Inspected listings from our highest rated sellers"
        parts={featuredListings}
        viewAllHref="/search"
        emptyActionHref="/search"
      />

      <FeaturedSellers sellers={sellers} />
      <FinalCTA />
    </div>
  );
}
