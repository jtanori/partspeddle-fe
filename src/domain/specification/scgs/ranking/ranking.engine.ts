import { CompiledSemanticArtifact } from '../types';
import { RankedResult, RankingFeatureFactors } from './ranking.types';

export class RankingEngine {
  // Weights based on SEARCH_RANKING_INVENTORY.md
  private static WEIGHTS = {
    listingQuality: 0.5,
    sellerTrust: 0.3,
    recency: 0.2
  };

  static rank(artifacts: CompiledSemanticArtifact[]): RankedResult[] {
    return artifacts
      .map(artifact => this.score(artifact))
      .sort((a, b) => {
        // Deterministic ranking with tie-breaking
        if (Math.abs(b.score - a.score) > 0.0001) {
            return b.score - a.score;
        }
        // Tie-breaker: lexicographical listingId ASC
        return a.listingId.localeCompare(b.listingId);
      });
  }

  private static score(artifact: CompiledSemanticArtifact): RankedResult {
    const factors = artifact.compiled.rankingFactors;

    const contributions = [
      { factor: "listing_quality_score", weight: this.WEIGHTS.listingQuality, rawValue: factors.listingQuality, contribution: this.WEIGHTS.listingQuality * factors.listingQuality },
      { factor: "seller_trust_score", weight: this.WEIGHTS.sellerTrust, rawValue: factors.sellerTrust, contribution: this.WEIGHTS.sellerTrust * factors.sellerTrust },
      { factor: "created_at", weight: this.WEIGHTS.recency, rawValue: factors.recency, contribution: this.WEIGHTS.recency * factors.recency }
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
}
