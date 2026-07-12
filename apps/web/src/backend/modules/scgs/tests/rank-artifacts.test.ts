import { describe, it, expect } from 'vitest';
import { rankArtifacts } from '../application/rank-artifacts';
import { CompiledSemanticArtifact } from '../domain/compiled-semantic-artifact';

function makeArtifact(listingId: string, listingQuality: number): CompiledSemanticArtifact {
  return {
    listingId,
    categoryId: 'cat-1',
    version: '1.0.0',
    lineageId: `${listingId}:1.0.0:abc` as CompiledSemanticArtifact['lineageId'],
    checksum: 'abc',
    compiled: {
      flat: [],
      grouped: [],
      facets: {},
      rankingFactors: { listingQuality, sellerTrust: 0.5, recency: 0.5 },
    },
    metadata: { createdAt: new Date().toISOString(), compilerVersion: '1.0.0' },
  };
}

describe('SCGS rankArtifacts use case', () => {
  it('binds each result to its source artifact', () => {
    const artifacts = [makeArtifact('a', 0.9), makeArtifact('b', 0.5)];
    const ranked = rankArtifacts(artifacts);

    expect(ranked).toHaveLength(2);
    expect(ranked[0].artifact.listingId).toBe('a');
    expect(ranked[0].result.listingId).toBe('a');
    expect(ranked[0].result.score).toBeGreaterThan(ranked[1].result.score);
  });

  it('preserves lineage on ranked artifacts', () => {
    const artifacts = [makeArtifact('a', 0.9)];
    const ranked = rankArtifacts(artifacts);

    expect(ranked[0].artifact.lineageId).toBe('a:1.0.0:abc');
  });
});
