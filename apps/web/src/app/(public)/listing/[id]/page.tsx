import React from 'react';
import { createAnonServerClient } from '@/lib/supabase-server';
import PDPRoot from '@/components/pdp-modern/PDPRoot';
import {
  SpecificationCompilerImpl,
  buildPDPViewModel,
  PDPViewModelPresentation,
  CatalogSpecificationFrameworkRepository,
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
  return {
    title: String(part.title ?? ''),
    subtitle: typeof part.subtitle === 'string' ? part.subtitle : undefined,
    price: typeof part.price === 'number' ? part.price : 0,
    condition: String(part.condition ?? 'Used'),
    images: Array.isArray(part.images) ? (part.images as string[]) : [],
    description: String(part.description ?? ''),
    sku: typeof part.trackingNumber === 'string' ? part.trackingNumber : undefined,
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

function buildCompatibilityInput(part: Record<string, unknown>) {
  const entries = Array.isArray(part.compatibility)
    ? (part.compatibility as Array<{ make: string; model: string; years: string; engine?: string }>)
    : [];

  return {
    entries,
    partNumber: typeof part.partNumber === 'string' ? part.partNumber : undefined,
    oemPartNumber: typeof part.oemPartNumber === 'string' ? part.oemPartNumber : undefined,
  };
}

function buildSellerTrustInput(
  seller: Record<string, unknown> | null,
  part: Record<string, unknown>,
) {
  return {
    sellerTrustScore: typeof part.sellerTrustScore === 'number' ? part.sellerTrustScore : 0.5,
    listingQualityScore: typeof part.listingQualityScore === 'number' ? part.listingQualityScore : 0.5,
    rating: typeof seller?.rating === 'number' ? seller.rating : undefined,
    reviewCount: typeof seller?.reviewCount === 'number' ? seller.reviewCount : undefined,
    feedbackPercentage: typeof seller?.feedbackPercentage === 'number' ? seller.feedbackPercentage : undefined,
    verificationStatus: seller?.verification_status ? String(seller.verification_status) : undefined,
    responseTime: seller?.responseTime ? String(seller.responseTime) : undefined,
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

  const partRecord = part as unknown as Record<string, unknown>;

  // Explicitly fetch seller profile
  const { data: seller } = await supabase
    .from('seller_profiles')
    .select('*')
    .eq('user_id', partRecord.seller_id)
    .maybeSingle();

  const specRepo: SpecificationRepository = {
    findByListingId: async () => [],
    getAllDefinitions: async () => [],
  };

  // SCGS projection flow
  const frameworkRepo = new CatalogSpecificationFrameworkRepository(catRepo, specRepo);
  const compiler = new SpecificationCompilerImpl(frameworkRepo, listingRepo);
  const artifact = await compiler.compile({
    listingId: id,
    categoryId: part.categoryId,
    seller: buildSellerTrustInput(seller, partRecord),
    compatibility: buildCompatibilityInput(partRecord),
  });
  const viewModel = buildPDPViewModel({
    artifact,
    presentation: buildPresentation(partRecord, seller),
  });

  return (
    <div className="bg-surface-secondary min-h-screen">
      <PDPRoot viewModel={viewModel} />
    </div>
  );
}
