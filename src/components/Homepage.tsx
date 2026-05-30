import React, { useState, useEffect } from 'react';
import { HighFidelityHero } from './homepage/HighFidelityHero';
import { TrustBar } from './homepage/TrustBar';
import { ListingsGrid } from './homepage/ListingsGrid';
import { FeaturedSellers } from './homepage/FeaturedSellers';
import { FinalCTA } from './homepage/FinalCTA';
import { MOCK_PARTS } from '../services/db';
import { Part } from '../types';

export default function Homepage() {
  const [featuredParts, setFeaturedParts] = useState<Part[]>([]);
  const [recentParts, setRecentParts] = useState<Part[]>([]);

  useEffect(() => {
    // In a real app, these would be fetched from Supabase
    setFeaturedParts(MOCK_PARTS.slice(0, 4));
    setRecentParts(MOCK_PARTS.slice(4, 8));
  }, []);

  return (
    <div className="flex flex-col">
      <HighFidelityHero />
      <TrustBar />
      
      <ListingsGrid 
        title="Featured Parts Index" 
        subtitle="Inspected listings from our highest rated sellers"
        parts={featuredParts}
      />

      <ListingsGrid 
        title="Recently Added Listings" 
        subtitle="Fresh inventory just hit the floor"
        parts={recentParts}
      />

      <FeaturedSellers />
      <FinalCTA />
    </div>
  );
}
