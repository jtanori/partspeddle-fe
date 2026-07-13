import { AlgoliaSearchRepository } from '@/backend/modules/search/infrastructure/algolia-search-repository';
import type { CompiledSemanticArtifact } from '../domain/compiled-semantic-artifact';
import type { Recommendation } from '../domain/recommendation';
import { compileRecommendations } from '../infrastructure/recommendation-compiler';

export interface BuildRecommendationsInput {
  source: CompiledSemanticArtifact;
  excludeIds?: string[];
  limit?: number;
}

export async function buildRecommendations(
  input: BuildRecommendationsInput,
  deps: { searchRepository?: AlgoliaSearchRepository } = {},
): Promise<Recommendation[]> {
  const searchRepository = deps.searchRepository ?? new AlgoliaSearchRepository();
  const source = input.source;

  // Build a query that surfaces same-category / same-part-type candidates.
  const partType = source.compiled.flat.find((s) => s.key === 'part_type')?.value as
    | string
    | undefined;
  const make = source.compiled.flat.find((s) => s.key === 'make')?.value as string | undefined;

  const filters: {
    categoryIds?: string[];
    partTypeIds?: string[];
    makeIds?: string[];
  } = {};

  if (source.categoryId) {
    filters.categoryIds = [source.categoryId];
  }
  if (partType) {
    filters.partTypeIds = [partType];
  }
  if (make) {
    filters.makeIds = [make];
  }

  const result = await searchRepository.search('', filters, 0, 100);

  return compileRecommendations({
    source,
    candidates: result.hits,
    excludeIds: input.excludeIds,
    limit: input.limit,
  });
}
