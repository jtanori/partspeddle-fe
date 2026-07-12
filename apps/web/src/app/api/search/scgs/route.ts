import { NextRequest, NextResponse } from 'next/server';
import { AlgoliaSearchRepository } from '@/backend/modules/search/infrastructure/algolia-search-repository';
import { SearchFilters as RepositorySearchFilters } from '@/backend/modules/search/domain/search-filters';
import { SearchDocument } from '@/backend/modules/search/domain/search-document';
import { SearchFilters } from '@/types';
import {
  rankArtifacts,
  buildSearchViewModel,
  SearchResultPresentation,
  CompiledSemanticArtifact,
  compileTrustProfile,
  compileCompatibility,
  compileFitment,
} from '@/backend/modules/scgs';
import { logger } from '@/lib/logger';

const searchRepository = new AlgoliaSearchRepository();

const MAX_AGE_DAYS = 30;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

function normalizeRecency(createdAt: number | undefined): number {
  if (typeof createdAt !== 'number' || Number.isNaN(createdAt)) {
    return 0.5;
  }
  const ageMs = Date.now() - createdAt * 1000;
  const ageDays = ageMs / MS_PER_DAY;
  return Math.max(0, Math.min(1, 1 - ageDays / MAX_AGE_DAYS));
}

function buildArtifactFromHit(hit: SearchDocument): CompiledSemanticArtifact {
  const listingId = hit.objectID;
  const categoryId = hit.category ?? 'unknown';
  const version = '1.0.0';
  const rankingFactors = {
    listingQuality: hit.listing_quality_score ?? 0.5,
    sellerTrust: hit.seller_trust_score ?? 0.5,
    recency: normalizeRecency(hit.created_at),
  };
  const trust = compileTrustProfile({
    sellerTrustScore: rankingFactors.sellerTrust,
    listingQualityScore: rankingFactors.listingQuality,
  });
  const compatibility = compileCompatibility({ entries: [] });
  const fitment = compileFitment({
    compatibility: { status: compatibility.status, vehicles: compatibility.vehicles },
  });

  return {
    listingId,
    categoryId,
    version,
    lineageId: `${listingId}:${version}:placeholder` as CompiledSemanticArtifact['lineageId'],
    checksum: 'placeholder',
    compiled: {
      flat: [],
      grouped: [],
      facets: {},
      rankingFactors,
      trust,
      compatibility,
      fitment,
    },
    metadata: {
      createdAt: new Date().toISOString(),
      compilerVersion: '1.0.0',
    },
  };
}

function buildPresentationFromHit(hit: SearchDocument): SearchResultPresentation {
  const fitmentSummary = [hit.year, hit.make, hit.model]
    .filter((v): v is string | number => v !== null && v !== undefined)
    .map(String)
    .join(' ');

  return {
    title: hit.title,
    price: hit.price,
    imageUrl: hit.image_url ?? undefined,
    subtitle: fitmentSummary || undefined,
    condition: hit.condition,
    sellerName: hit.seller_name,
    sellerRating: hit.seller_trust_score / 20,
    sellerReviewCount: 0,
    fitmentSummary: fitmentSummary || undefined,
  };
}

export async function GET(req: NextRequest) {
  const startMs = Date.now();
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q') ?? '';
  const page = Number(searchParams.get('page') ?? 0);
  const hitsPerPage = Number(searchParams.get('hitsPerPage') ?? 20);
  const category = searchParams.get('category');

  try {
    const repositoryFilters: RepositorySearchFilters = {
      makeIds: [],
      modelIds: [],
      categoryIds: category ? [category] : [],
      partTypeIds: [],
      condition: [],
    };

    const algoliaResult = await searchRepository.search(
      query,
      repositoryFilters,
      page,
      hitsPerPage,
    );

    const artifacts = algoliaResult.hits.map(buildArtifactFromHit);
    const ranked = rankArtifacts(artifacts);

    const presentations: Record<string, SearchResultPresentation> = {};
    for (const hit of algoliaResult.hits) {
      presentations[String(hit.objectID)] = buildPresentationFromHit(hit);
    }

    const uiFilters: SearchFilters = {
      query,
      system: '',
      category: category ?? '',
      partTypes: [],
      priceRange: [0, 10000],
      conditions: [],
      sellerType: 'all',
      fitmentMake: 'All Makes',
      fitmentModel: 'All Models',
      fitmentYear: 'All Years',
      fitmentEngine: 'All Engines',
    };

    const viewModel = buildSearchViewModel({
      rankedArtifacts: ranked,
      presentations,
      facets: algoliaResult.facets as Record<string, Record<string, number>>,
      filters: uiFilters,
      page: algoliaResult.page,
      pageSize: hitsPerPage,
      total: algoliaResult.totalHits,
      query,
      queryMs: Date.now() - startMs,
    });

    return NextResponse.json(viewModel);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error('SCGS search view-model failed', { error: message, query });
    return NextResponse.json({ error: 'SCGS search view-model failed', message }, { status: 500 });
  }
}
