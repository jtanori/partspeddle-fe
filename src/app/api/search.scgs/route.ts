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
  const ranked = RankingEngine.rank(hits.map(h => ({ 
      listingId: h.objectID, 
      categoryId: h.categorySlug,
      compiled: {
          rankingFactors: {
              listingQuality: h.listing_quality_score || 0.5,
              sellerTrust: h.seller_trust_score || 0.5,
              recency: h.created_at ? 1.0 - (Date.now() - new Date(h.created_at).getTime()) / (30 * 86400000) : 0.5
          }
      }
  } as unknown as CompiledSemanticArtifact)));
  
  // Map ranked order back to original hits
  const rankedHits = ranked.map(r => hits.find(h => h.objectID === r.listingId)).filter(Boolean);
  
  // Attach ranking explainability to results
  const viewModel = buildSearchProjection(rankedHits as any, p, 20, nbHits);
  viewModel.meta.source = "SCGS"; // Now powered by the pipeline

  viewModel.results = viewModel.results.map(r => ({
      ...r,
      ranking: ranked.find(rnk => rnk.listingId === r.id)?.explanation
  }));

  return NextResponse.json(viewModel);
}
