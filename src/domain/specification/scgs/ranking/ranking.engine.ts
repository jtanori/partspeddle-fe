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
    // Ported factors from inventory
    const factors: RankingFeatureFactors = {
      listingQualityScore: 0.8, // In production, extract from artifact.compiled.metadata
      sellerTrustScore: 0.7,
      recencyScore: 0.9
    };

    const contributions = [
      { factor: "listing_quality_score", weight: this.WEIGHTS.listingQuality, rawValue: factors.listingQualityScore, contribution: this.WEIGHTS.listingQuality * factors.listingQualityScore },
      { factor: "seller_trust_score", weight: this.WEIGHTS.sellerTrust, rawValue: factors.sellerTrustScore, contribution: this.WEIGHTS.sellerTrust * factors.sellerTrustScore },
      { factor: "created_at", weight: this.WEIGHTS.recency, rawValue: factors.recencyScore, contribution: this.WEIGHTS.recency * factors.recencyScore }
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
