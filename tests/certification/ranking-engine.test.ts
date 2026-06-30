import { describe, test, expect } from 'vitest';
import { RankingEngine } from '../../src/domain/specification/scgs/ranking/ranking.engine';
import { CompiledSemanticArtifact } from '../../src/domain/specification/scgs/types';

describe("C.0.8 - Ranking Engine Certification", () => {
  test("Ranking determinism: same input must yield same rank/score", () => {
    const mockArtifacts: CompiledSemanticArtifact[] = [
      {
        listingId: '1',
        categoryId: 'c1',
        version: 'v1',
        compiled: { flat: [], grouped: [], facets: {}, rankingFactors: { listingQuality: 0.9, sellerTrust: 0.8, recency: 0.7 } },
        checksum: 'h1',
        metadata: { createdAt: '', compilerVersion: '1' }
      },
      {
        listingId: '2',
        categoryId: 'c1',
        version: 'v1',
        compiled: { flat: [], grouped: [], facets: {}, rankingFactors: { listingQuality: 0.9, sellerTrust: 0.8, recency: 0.7 } },
        checksum: 'h2',
        metadata: { createdAt: '', compilerVersion: '1' }
      }
    ];

    const r1 = RankingEngine.rank(mockArtifacts);
    const r2 = RankingEngine.rank(mockArtifacts);

    expect(r1).toEqual(r2);
  });

  test("Ranking explanation must be present for all results", () => {
    const mockArtifacts: CompiledSemanticArtifact[] = [
      {
        listingId: '1',
        categoryId: 'c1',
        version: 'v1',
        compiled: { flat: [], grouped: [], facets: {}, rankingFactors: { listingQuality: 0.9, sellerTrust: 0.8, recency: 0.7 } },
        checksum: 'h1',
        metadata: { createdAt: '', compilerVersion: '1' }
      }
    ];

    const ranked = RankingEngine.rank(mockArtifacts);
    expect(ranked[0].explanation).toBeDefined();
    expect(ranked[0].explanation.contributions.length).toBeGreaterThan(0);
  });
});
