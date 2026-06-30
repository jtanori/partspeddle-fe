import { CompiledSpecificationSet } from '../../../services/specification.compiler';
import { RankedResult, RankingContribution } from './ranking.types';

export class RankingEngine {
  // Weights based on SEARCH_RANKING_INVENTORY.md
  private static WEIGHTS = {
    listingQuality: 0.5,
    sellerTrust: 0.3,
    recency: 0.2
  };

  static rank(artifacts: { listingId: string; compiled?: CompiledSpecificationSet }[]): RankedResult[] {
    const ranked = artifacts
      .map(artifact => this.score(artifact))
      .sort((a, b) => {
        if (Math.abs(b.score - a.score) > 0.0001) {
          return b.score - a.score;
        }
        return a.listingId.localeCompare(b.listingId);
      });

    return ranked;
  }

  private static score(artifact: { listingId: string; compiled?: CompiledSpecificationSet }): RankedResult {
    const factors = this.getRankingFactors(artifact.compiled);

    const contributions: RankingContribution[] = [
      {
        factor: "listing_quality_score",
        weight: this.WEIGHTS.listingQuality,
        rawValue: factors.listingQuality,
        contribution: this.WEIGHTS.listingQuality * factors.listingQuality
      },
      {
        factor: "seller_trust_score",
        weight: this.WEIGHTS.sellerTrust,
        rawValue: factors.sellerTrust,
        contribution: this.WEIGHTS.sellerTrust * factors.sellerTrust
      },
      {
        factor: "created_at",
        weight: this.WEIGHTS.recency,
        rawValue: factors.recency,
        contribution: this.WEIGHTS.recency * factors.recency
      }
    ];

    const finalScore = contributions.reduce((sum, c) => sum + c.contribution, 0);

    return {
      listingId: artifact.listingId,
      score: finalScore,
      explanation: {
        finalScore,
        contributions
      }
    };
  }

  private static getRankingFactors(compiled?: CompiledSpecificationSet): {
    listingQuality: number;
    sellerTrust: number;
    recency: number;
  } {
    return compiled?.rankingFactors ?? { listingQuality: 0, sellerTrust: 0, recency: 0 };
  }
}
