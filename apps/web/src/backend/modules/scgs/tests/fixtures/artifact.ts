import type { CompiledSpecificationSet } from '../../domain/compiled-specification-set';
import type { CompiledSemanticArtifact } from '../../domain/compiled-semantic-artifact';

export function makeCompiledSpecificationSet(
  overrides: Partial<CompiledSpecificationSet> = {},
): CompiledSpecificationSet {
  const now = new Date().toISOString();
  return {
    flat: [],
    grouped: [],
    facets: {},
    rankingFactors: {
      listingQuality: 0,
      sellerTrust: 0,
      recency: 0,
      imageQuality: 0,
      inventoryCompleteness: 0,
      popularity: 0,
      responseRate: 0,
      conversionScore: 0,
    },
    trust: {
      score: 0.5,
      level: 'medium',
      signals: [],
      compiledAt: now,
    },
    compatibility: {
      status: 'unknown',
      confidence: 0,
      vehicles: [],
      notes: [],
      compiledAt: now,
    },
    fitment: {
      status: 'unknown',
      fitmentScore: 0,
      vehicles: [],
      notes: [],
      compiledAt: now,
    },
    ...overrides,
  };
}

export function makeArtifact(
  overrides: Partial<CompiledSemanticArtifact> = {},
): CompiledSemanticArtifact {
  const version = overrides.version ?? '1.0.0';
  return {
    listingId: 'listing-1',
    categoryId: 'cat-1',
    version,
    lineageId: `lineage-${version}` as CompiledSemanticArtifact['lineageId'],
    compiled: makeCompiledSpecificationSet(),
    checksum: `checksum-${version}`,
    metadata: { createdAt: new Date().toISOString(), compilerVersion: '1.0.0' },
    ...overrides,
  };
}
