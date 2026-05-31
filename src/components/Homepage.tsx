import React, { useState, useEffect } from 'react';
import { HighFidelityHero } from './homepage/HighFidelityHero';
import { TrustBar } from './homepage/TrustBar';
import { ListingsGrid } from './homepage/ListingsGrid';
import { FeaturedSellers } from './homepage/FeaturedSellers';
import { FinalCTA } from './homepage/FinalCTA';
import { supabase } from '../lib/supabase';
import { Part } from '../types';

export default function Homepage() {
  const [featuredParts, setFeaturedParts] = useState<Part[]>([]);
  const [recentParts, setRecentParts] = useState<Part[]>([]);

  useEffect(() => {
    const fetchParts = async () => {
      // Fetch featured
      const { data: featured } = await supabase
        .from('parts')
        .select('*')
        .eq('featured', true)
        .limit(4);
      
      // Fetch recent
      const { data: recent } = await supabase
        .from('parts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(4);

      setFeaturedParts(featured || []);
      setRecentParts(recent || []);
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
