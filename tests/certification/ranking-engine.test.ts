import { describe, test, expect } from 'vitest';
import { RankingEngine } from '../../src/domain/specification/scgs/ranking/ranking.engine';
import { CompiledSpecificationSet } from '../../src/domain/services/specification.compiler';

type RankingArtifact = {
  listingId: string;
  compiled?: CompiledSpecificationSet;
};

function mockArtifact(
  listingId: string,
  factors: CompiledSpecificationSet['rankingFactors'],
): RankingArtifact {
  return {
    listingId,
    compiled: {
      flat: [],
      grouped: [],
      facets: {},
      rankingFactors: factors,
    },
  };
}

describe('C.0.8 - Ranking Engine Certification', () => {
  test('Ranking determinism: same input must yield same rank/score', () => {
    const mockArtifacts: RankingArtifact[] = [
      mockArtifact('1', { listingQuality: 0.9, sellerTrust: 0.8, recency: 0.7 }),
      mockArtifact('2', { listingQuality: 0.9, sellerTrust: 0.8, recency: 0.7 }),
    ];

    const r1 = RankingEngine.rank(mockArtifacts);
    const r2 = RankingEngine.rank(mockArtifacts);

    expect(r1).toEqual(r2);
  });

  test('Ranking explanation must be present for all results', () => {
    const mockArtifacts: RankingArtifact[] = [
      mockArtifact('1', { listingQuality: 0.9, sellerTrust: 0.8, recency: 0.7 }),
    ];

    const ranked = RankingEngine.rank(mockArtifacts);
    expect(ranked[0].explanation).toBeDefined();
    expect(ranked[0].explanation.contributions.length).toBeGreaterThan(0);
  });

  test('Missing ranking factors default to zero', () => {
    const mockArtifacts: RankingArtifact[] = [{ listingId: '1' }];

    const ranked = RankingEngine.rank(mockArtifacts);
    expect(ranked[0].score).toBe(0);
    expect(ranked[0].explanation.contributions.every((c) => c.rawValue === 0)).toBe(true);
  });

  test('Higher listing quality outranks lower quality when other factors are equal', () => {
    const mockArtifacts: RankingArtifact[] = [
      mockArtifact('low', { listingQuality: 0.5, sellerTrust: 0.5, recency: 0.5 }),
      mockArtifact('high', { listingQuality: 0.9, sellerTrust: 0.5, recency: 0.5 }),
    ];

    const ranked = RankingEngine.rank(mockArtifacts);
    expect(ranked[0].listingId).toBe('high');
    expect(ranked[1].listingId).toBe('low');
  });
});
