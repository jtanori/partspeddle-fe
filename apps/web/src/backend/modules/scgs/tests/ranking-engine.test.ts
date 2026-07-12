import { describe, it, expect } from 'vitest';
import { RankingEngine } from '../infrastructure/ranking-engine';
import { CompiledSpecificationSet } from '../domain/compiled-specification-set';

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

describe('SCGS RankingEngine', () => {
  it('is deterministic for identical inputs', () => {
    const artifacts: RankingArtifact[] = [
      mockArtifact('1', { listingQuality: 0.9, sellerTrust: 0.8, recency: 0.7 }),
      mockArtifact('2', { listingQuality: 0.5, sellerTrust: 0.5, recency: 0.5 }),
    ];

    const r1 = RankingEngine.rank(artifacts);
    const r2 = RankingEngine.rank(artifacts);

    expect(r1).toEqual(r2);
  });

  it('includes expanded signal contributions', () => {
    const artifacts: RankingArtifact[] = [
      mockArtifact('1', {
        listingQuality: 0.9,
        sellerTrust: 0.8,
        recency: 0.7,
        imageQuality: 0.6,
        inventoryCompleteness: 0.5,
        popularity: 0.4,
        responseRate: 0.3,
        conversionScore: 0.2,
      }),
    ];

    const ranked = RankingEngine.rank(artifacts);
    const contributionFactors = ranked[0].explanation.contributions.map(c => c.factor);

    expect(contributionFactors).toContain('image_quality_score');
    expect(contributionFactors).toContain('inventory_completeness_score');
    expect(contributionFactors).toContain('popularity_score');
    expect(contributionFactors).toContain('response_rate_score');
    expect(contributionFactors).toContain('conversion_score');
  });

  it('normalizes out-of-range values', () => {
    const artifacts: RankingArtifact[] = [
      mockArtifact('1', { listingQuality: 1.5, sellerTrust: -0.3, recency: 0.5 }),
    ];

    const ranked = RankingEngine.rank(artifacts);
    const quality = ranked[0].explanation.contributions.find(c => c.factor === 'listing_quality_score');

    expect(quality?.normalizedValue).toBe(1);
    expect(quality?.rawValue).toBe(1.5);
  });

  it('higher listing quality outranks lower quality when other factors are equal', () => {
    const artifacts: RankingArtifact[] = [
      mockArtifact('low', { listingQuality: 0.5, sellerTrust: 0.5, recency: 0.5 }),
      mockArtifact('high', { listingQuality: 0.9, sellerTrust: 0.5, recency: 0.5 }),
    ];

    const ranked = RankingEngine.rank(artifacts);
    expect(ranked[0].listingId).toBe('high');
    expect(ranked[1].listingId).toBe('low');
  });

  it('defaults missing factors to zero', () => {
    const artifacts: RankingArtifact[] = [{ listingId: '1' }];

    const ranked = RankingEngine.rank(artifacts);
    expect(ranked[0].score).toBe(0);
    expect(ranked[0].explanation.contributions.every(c => c.normalizedValue === 0)).toBe(true);
  });
});
