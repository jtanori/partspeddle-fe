import React from 'react';
import { createAnonServerClient } from '@/lib/supabase-server';
import PDPRoot from '@/components/pdp-modern/PDPRoot';
import {
  SpecificationCompilerImpl,
  buildPDPViewModel,
  PDPViewModelPresentation,
} from '@/backend/modules/scgs';
import { SpecificationRepository } from '@/backend/modules/catalog/domain/specification-repository';
import { CatalogRepository, SupabaseCatalogRepository } from '@/backend/modules/catalog';
import { ListingRepository, SupabaseListingRepository } from '@/backend/modules/listing';

import { unstable_noStore as noStore } from 'next/cache';

interface Props {
  params: Promise<{ id: string }>;
}

function buildPresentation(
  part: Record<string, unknown>,
  seller: Record<string, unknown> | null,
): PDPViewModelPresentation {
  const compatibility = Array.isArray(part.compatibility)
    ? (part.compatibility as Array<{ make: string; model: string; years: string; engine?: string }>)
    : [];

  return {
    title: String(part.title ?? ''),
    subtitle: typeof part.subtitle === 'string' ? part.subtitle : undefined,
    price: typeof part.price === 'number' ? part.price : 0,
    condition: String(part.condition ?? 'Used'),
    images: Array.isArray(part.images) ? (part.images as string[]) : [],
    description: String(part.description ?? ''),
    sku: typeof part.trackingNumber === 'string' ? part.trackingNumber : undefined,
    compatibility,
    seller: {
      id: seller?.id ? String(seller.id) : 'unknown',
      displayName: seller?.name ? String(seller.name) : 'Unknown Seller',
      rating: typeof seller?.rating === 'number' ? seller.rating : 4.8,
      location: seller?.location ? String(seller.location) : 'Unknown',
      responseTime: seller?.responseTime ? String(seller.responseTime) : undefined,
    },
    crossSell: [],
  };
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
    .eq('user_id', (part as unknown as Record<string, unknown>).seller_id)
    .maybeSingle();

  const specRepo: SpecificationRepository = {
    findByListingId: async () => [],
    getAllDefinitions: async () => [],
  };

  // SCGS projection flow
  const compiler = new SpecificationCompilerImpl(specRepo, catRepo, listingRepo);
  const artifact = await compiler.compile({
    listingId: id,
    categoryId: part.categoryId,
  });
  const viewModel = buildPDPViewModel({
    artifact,
    presentation: buildPresentation(part as unknown as Record<string, unknown>, seller),
  });

  return (
    <div className="bg-surface-secondary min-h-screen">
      <PDPRoot viewModel={viewModel} />
    </div>
  );
}
