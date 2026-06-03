import React, { useState, useEffect } from 'react';
import { HighFidelityHero } from './homepage/HighFidelityHero';
import { TrustBar } from './homepage/TrustBar';
import { ListingsGrid } from './homepage/ListingsGrid';
import { FeaturedSellers } from './homepage/FeaturedSellers';
import { FinalCTA } from './homepage/FinalCTA';
import { supabaseDb } from '../services/supabase-db';
import { Part } from '../types';

export default function Homepage() {
  const [featuredParts, setFeaturedParts] = useState<Part[]>([]);
  const [recentParts, setRecentParts] = useState<Part[]>([]);

  useEffect(() => {
    const fetchParts = async () => {
      try {
        const [featured, recent] = await Promise.all([
          supabaseDb.getFeaturedParts(8),
          supabaseDb.getFeaturedParts(4)
        ]);
        setFeaturedParts(featured || []);
        setRecentParts(recent || []);
      } catch (err) {
        console.error('Error fetching parts:', err);
      }
    };
    fetchParts();
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
