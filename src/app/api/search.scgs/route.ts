import { NextResponse } from 'next/server';
import { buildSearchProjection } from '@/projection/search';
import { algoliaClient } from '@/backend/modules/search/infrastructure/algolia-client';
import { RankingEngine } from '@/domain/specification/scgs/ranking/ranking.engine';
import { CompiledSemanticArtifact } from '@/domain/specification/scgs/types';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q') ?? '';
  const page = Number(searchParams.get('page') ?? 0);

  // 1. Fetch from current source (Algolia)
  const { hits, page: p, nbPages, nbHits } = await algoliaClient.search(query, { page });

  // 2. Project via new SCGS projection layer, wrapped with RankingEngine integration
  // RankingEngine is currently in neutral mode (no behavior change)
  const ranked = RankingEngine.rank(hits.map(h => ({ listingId: h.objectID, categoryId: h.categorySlug } as CompiledSemanticArtifact)));
  
  const viewModel = buildSearchProjection(hits as any, p, 20, nbHits);
  viewModel.meta.source = "SCGS"; // Now powered by the pipeline

  return NextResponse.json(viewModel);
}
