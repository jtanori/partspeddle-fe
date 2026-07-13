import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAnonServerClient } from '@/lib/supabase-server';
import {
  SpecificationCompilerImpl,
  CatalogSpecificationFrameworkRepository,
  buildRecommendations,
} from '@/backend/modules/scgs';
import { SpecificationRepository } from '@/backend/modules/catalog/domain/specification-repository';
import { CatalogRepository, SupabaseCatalogRepository } from '@/backend/modules/catalog';
import { ListingRepository, SupabaseListingRepository } from '@/backend/modules/listing';
import { logger } from '@/lib/logger';
import { rateLimit } from '@/lib/api/rate-limit';

const recommendationsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(20).optional().default(6),
});

function buildSellerTrustInput(
  seller: Record<string, unknown> | null,
  part: Record<string, unknown>,
) {
  return {
    sellerTrustScore: typeof part.sellerTrustScore === 'number' ? part.sellerTrustScore : 0.5,
    listingQualityScore:
      typeof part.listingQualityScore === 'number' ? part.listingQualityScore : 0.5,
    rating: typeof seller?.rating === 'number' ? seller.rating : undefined,
    reviewCount: typeof seller?.reviewCount === 'number' ? seller.reviewCount : undefined,
    feedbackPercentage:
      typeof seller?.feedbackPercentage === 'number' ? seller.feedbackPercentage : undefined,
    verificationStatus: seller?.verification_status
      ? String(seller.verification_status)
      : undefined,
    responseTime: seller?.responseTime ? String(seller.responseTime) : undefined,
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

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const rateLimited = rateLimit(req, {
    keyPrefix: 'recommendations',
    limit: 60,
    windowSeconds: 60,
  });
  if (rateLimited) {
    return rateLimited;
  }

  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const parsed = recommendationsQuerySchema.safeParse({
      limit: searchParams.get('limit') ?? '6',
    });
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid limit' }, { status: 400 });
    }

    const supabase = createAnonServerClient();
    const listingRepo: ListingRepository = new SupabaseListingRepository(supabase);
    const catRepo: CatalogRepository = new SupabaseCatalogRepository(supabase);

    const part = await listingRepo.findById(id);
    if (!part) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    const partRecord = part as unknown as Record<string, unknown>;
    const { data: seller } = await supabase
      .from('seller_profiles')
      .select('*')
      .eq('user_id', partRecord.seller_id)
      .maybeSingle();

    const specRepo: SpecificationRepository = {
      findByListingId: async () => [],
      getAllDefinitions: async () => [],
    };

    const frameworkRepo = new CatalogSpecificationFrameworkRepository(catRepo, specRepo);
    const compiler = new SpecificationCompilerImpl(frameworkRepo, listingRepo);
    const artifact = await compiler.compile({
      listingId: id,
      categoryId: part.categoryId,
      seller: buildSellerTrustInput(seller, partRecord),
      compatibility: buildCompatibilityInput(partRecord),
    });

    const recommendations = await buildRecommendations({
      source: artifact,
      excludeIds: [id],
      limit: parsed.data.limit,
    });

    return NextResponse.json({ recommendations });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Recommendations API failure', { error: message });
    return NextResponse.json({ error: 'Recommendations unavailable' }, { status: 500 });
  }
}
