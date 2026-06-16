import React from 'react';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { PartViewModelBuilder } from '@/backend/modules/pdp/application/part-view-model-builder';
import ProductDetail from '@/components/pdp-modern/ProductDetail';

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

  if (partError || !part) {
    return <div>Part not found</div>;
  }

  // Explicitly fetch seller profile
  const { data: seller } = await supabaseAdmin
    .from('seller_profiles')
    .select('*')
    .eq('user_id', part.seller_id)
    .maybeSingle();

  // Build ViewModel
  const builder = new PartViewModelBuilder();
  const viewModel = builder.build(part, seller);

  return (
    <div className="bg-base-cream min-h-screen">
      <ProductDetail viewModel={viewModel} />
    </div>
  );
}
