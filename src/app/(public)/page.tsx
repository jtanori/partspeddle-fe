import { HighFidelityHero } from '@/components/homepage/HighFidelityHero';
import { ListingsGrid } from '@/components/homepage/ListingsGrid';
import { FeaturedSellers } from '@/components/homepage/FeaturedSellers';
import { FinalCTA } from '@/components/homepage/FinalCTA';
import { createAnonServerClient } from '@/lib/supabase-server';
import type { Metadata } from 'next';
import { Part, Seller } from '@/types';
import { tracer } from '@/lib/observability';

import { unstable_noStore as noStore } from 'next/cache';

export const metadata: Metadata = {
  title: 'PartsPeddle | Peer to peer farm and auto parts marketplace',
  description:
    'Built for mechanics, enthusiasts, farmers, salvage yards, and independent sellers, trade with trust.',
};

// Internal mapping functions to keep the component clean
const mapPart = (row: any): Part => {
  return {
    id: row.id,
    title: row.title || 'Unknown Part',
    subtitle: row.title || 'Unknown Part',
    price: (row.price_mxn || 0) / 20,
    images: row.part_images?.map((img: any) => img.url) || [],
    seller: undefined,
    trackingNumber: 'N/A',
    condition: 'USED_GOOD',
    system: 'General',
    category: 'General',
    partType: 'General',
    oemPartNumber: '',
    interchangePartNumbers: [],
    weight: '',
    fits: '',
    description: row.description || '',
    sellerId: row.seller_id || '',
    compatibility: [],
    mileage: 'Unknown',
    views: 0,
  } as Part;
};

const mapSeller = (row: any): Seller => ({
  id: row.id,
  name: row.business_name,
  businessName: row.business_name,
  logoUrl: row.users?.avatar_url,
  rating: 5.0, // Default
  reviewCount: 0,
  location: row.location || 'Unknown',
  partCount: 0,
  feedbackPercentage: 100,
  shipsWithin: '24h',
  returnPolicy: 'Standard',
});

export default async function Homepage() {
  noStore();
  return tracer.startActiveSpan('homepage-fetch-data', async (span) => {
    const supabase = createAnonServerClient();
    const [featuredRes, recentRes, sellersRes] = await Promise.all([
      supabase
        .from('parts')
        .select('id, title, description, price_mxn, created_at, part_images(url)')
        .eq('status', 'AVAILABLE')
        .order('views', { ascending: false })
        .limit(8),
      supabase
        .from('parts')
        .select('id, title, description, price_mxn, created_at, part_images(url)')
        .eq('status', 'AVAILABLE')
        .order('created_at', { ascending: false })
        .limit(4),
      supabase
        .from('seller_profiles')
        .select('id, business_name, location, users(avatar_url)')
        .limit(4),
    ]);

    span.end();

    const featuredParts = (featuredRes.data || []).map(mapPart);
    const recentParts = (recentRes.data || []).map(mapPart);
    const featuredSellers = (sellersRes.data || []).map(mapSeller);

    return (
      <div className="flex flex-col">
        <HighFidelityHero />

        <ListingsGrid
          title="Featured Inventory"
          subtitle="Inspected listings from our highest rated sellers"
          parts={featuredParts}
        />

        <ListingsGrid
          title="Recently Added Listings"
          subtitle="Fresh inventory just hit the floor"
          parts={recentParts}
        />

        <FeaturedSellers sellers={featuredSellers} />
        <FinalCTA />
      </div>
    );
  });
}
