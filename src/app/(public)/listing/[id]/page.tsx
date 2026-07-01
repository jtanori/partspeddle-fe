import React from 'react';
import { supabaseAdmin } from '@/lib/supabase-admin';
import PDPRoot from '@/components/pdp-modern/PDPRoot';
import { SpecificationCompilerImpl } from '@/domain/services/specification.compiler';
import { buildPDPView } from '@/projection/pdp';
import { SpecificationRepository } from '@/repositories/specification.repository';
import { CatalogRepository } from '@/repositories/catalog.repository';

// Mock implementations for demo
const specRepo: SpecificationRepository = {
  findByListingId: async (id) => [],
  getAllDefinitions: async () => [],
};
const catRepo: CatalogRepository = {
  getCategory: async (slug) => null,
  getSpecificationsForCategory: async (id) => [],
  getDefinition: async (id) => null,
};
const listingRepo: ListingRepository = {
  findById: async (id) => null
};

import { unstable_noStore as noStore } from "next/cache";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ListingDetailPage({ params }: Props) {
  noStore();
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

  // New projection flow
  const compiler = new SpecificationCompilerImpl(specRepo, catRepo, listingRepo);
  const compiled = await compiler.compile({ listingId: id, categoryId: part.category_id });
  const viewModel = buildPDPView(part, seller, compiled);

  return (
    <div className="bg-base-cream min-h-screen">
      <PDPRoot viewModel={viewModel} />
    </div>
  );
}
