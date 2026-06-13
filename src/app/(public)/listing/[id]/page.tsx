import React from 'react';
import { supabaseAdmin } from '@/lib/supabase-admin';
import ProductDetailClient from '@/components/ProductDetailClient';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ListingDetailPage({ params }: Props) {
  const { id } = await params;

  // Server-side fetch
  const { data: part, error } = await supabaseAdmin
    .from('parts')
    .select('*, seller_profiles(*)')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('Supabase Error:', error);
    return <div>Error loading part: {error.message}</div>;
  }
  
  if (!part) {
    console.error('Part not found for ID:', id);
    return <div>Part not found</div>;
  }

  return (
    <div className="bg-base-cream min-h-screen">
      <ProductDetailClient initialPart={part} />
    </div>
  );
}
