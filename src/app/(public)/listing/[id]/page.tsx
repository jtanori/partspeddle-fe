import React from 'react';
import { supabaseAdmin } from '@/lib/supabase-admin';
import ProductDetailClient from '@/components/ProductDetailClient';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ListingDetailPage({ params }: Props) {
  const { id } = await params;

  // Server-side fetch
  const { data: part, error: partError } = await supabaseAdmin
    .from('parts')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (partError) {
    console.error('Supabase Error (Part):', partError);
    return <div>Error loading part: {partError.message}</div>;
  }
  
  if (!part) {
    console.error('Part not found for ID:', id);
    return <div>Part not found</div>;
  }

  // Explicitly fetch seller profile
  const { data: seller, error: sellerError } = await supabaseAdmin
    .from('seller_profiles')
    .select('*')
    .eq('user_id', part.seller_id)
    .maybeSingle();

  if (sellerError) {
      console.warn('Seller profile fetch warning:', sellerError);
  }

  return (
    <div className="bg-base-cream min-h-screen">
      <ProductDetailClient initialPart={{...part, seller}} />
    </div>
  );
}
