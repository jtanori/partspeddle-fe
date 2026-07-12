import React from 'react';
import { createAnonServerClient } from '@/lib/supabase-server';
import PDPRoot from '@/components/pdp-modern/PDPRoot';
import { SpecificationCompilerImpl } from '@/domain/services/specification.compiler';
import { buildPDPView } from '@/projection/pdp';
import { SpecificationRepository } from '@/repositories/specification.repository';
import { CatalogRepository } from '@/repositories/catalog.repository';
import { ListingRepository } from '@/repositories/listing.repository';
import { SupabaseCatalogRepository } from '@/repositories/impl/supabase-catalog.repository';
import { SupabaseListingRepository } from '@/repositories/impl/supabase-listing.repository';

import { unstable_noStore as noStore } from 'next/cache';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ListingDetailPage({ params }: Props) {
  noStore();
  const { id } = await params;

  const supabase = createAnonServerClient();
  const listingRepo: ListingRepository = new SupabaseListingRepository(supabase);
  const catRepo: CatalogRepository = new SupabaseCatalogRepository(supabase);

  // Server-side fetch
  const part = await listingRepo.findById(id);

  if (!part) {
    return <div>Part not found</div>;
  }

  // Explicitly fetch seller profile
  const { data: seller } = await supabase
    .from('seller_profiles')
    .select('*')
    .eq('user_id', (part as any).seller_id)
    .maybeSingle();

  const specRepo: SpecificationRepository = {
    findByListingId: async () => [],
    getAllDefinitions: async () => [],
  };

  // New projection flow
  const compiler = new SpecificationCompilerImpl(specRepo, catRepo, listingRepo);
  const compiled = await compiler.compile({
    listingId: id,
    categoryId: (part as any).category_id,
  });
  const viewModel = buildPDPView(part as any, seller, compiled);

  return (
    <div className="bg-surface-secondary min-h-screen">
      <PDPRoot viewModel={viewModel} />
    </div>
  );
}
