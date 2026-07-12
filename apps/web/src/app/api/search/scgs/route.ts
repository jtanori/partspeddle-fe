import { NextRequest, NextResponse } from 'next/server';
import { AlgoliaSearchRepository } from '@/backend/modules/search/infrastructure/algolia-search-repository';
import { SearchFilters } from '@/backend/modules/search/domain/search-filters';
import { RankingEngine } from '@/backend/modules/scgs';
import { buildSearchProjection } from '@/projection/search';
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

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q') ?? '';
  const page = Number(searchParams.get('page') ?? 0);
  const hitsPerPage = Number(searchParams.get('hitsPerPage') ?? 20);
  const category = searchParams.get('category');

  try {
    const filters: SearchFilters = {
      makeIds: [],
      modelIds: [],
      categoryIds: category ? [category] : [],
      partTypeIds: [],
      condition: [],
    };

    const algoliaResult = await searchRepository.search(query, filters, page, hitsPerPage);

    const ranked = RankingEngine.rank(
      algoliaResult.hits.map((hit) => ({
        listingId: hit.objectID,
        compiled: {
          flat: [],
          grouped: [],
          facets: {},
          rankingFactors: {
            listingQuality: hit.listing_quality_score ?? 0.5,
            sellerTrust: hit.seller_trust_score ?? 0.5,
            recency: normalizeRecency(hit.created_at),
          },
        },
      })),
    );

    const rankedHits = ranked
      .map((r) => algoliaResult.hits.find((h) => h.objectID === r.listingId))
      .filter((h): h is NonNullable<typeof h> => h !== undefined);

    const algoliaTopIds = algoliaResult.hits.slice(0, 10).map((h) => h.objectID);
    const scgsTopIds = ranked.slice(0, 10).map((r) => r.listingId);
    const overlap = algoliaTopIds.filter((id) => scgsTopIds.includes(id));

    const viewModel = buildSearchProjection(
      rankedHits as unknown as Record<string, unknown>[],
      algoliaResult.page,
      hitsPerPage,
      algoliaResult.totalHits,
      algoliaResult.facets,
      undefined,
      'SCGS',
    );

    return NextResponse.json({
      meta: {
        query,
        page,
        hitsPerPage,
        totalHits: algoliaResult.totalHits,
        source: 'SCGS',
      },
      comparison: {
        algoliaTop10: algoliaTopIds,
        scgsTop10: scgsTopIds,
        top10Overlap: overlap.length,
        top10OverlapPercent:
          algoliaTopIds.length > 0 ? Math.round((overlap.length / algoliaTopIds.length) * 100) : 0,
      },
      scgsScores: ranked.slice(0, 20).map((r) => ({
        listingId: r.listingId,
        score: r.score,
        contributions: r.explanation.contributions,
      })),
      viewModel,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error('SCGS ranking comparison failed', { error: message, query });
    return NextResponse.json({ error: 'SCGS ranking comparison failed', message }, { status: 500 });
  }
}
