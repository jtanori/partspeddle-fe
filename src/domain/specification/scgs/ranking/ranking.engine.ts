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
      .sort((a, b) => b.score - a.score);
  }

  private static score(artifact: CompiledSemanticArtifact): RankedResult {
    // In a real scenario, these factors are extracted from artifact metadata
    const factors: RankingFeatureFactors = {
      listingQualityScore: 0.8, // placeholder extraction
      sellerTrustScore: 0.9,
      recencyScore: 0.5
    };

    const contributions = [
      { factor: "listingQuality", weight: this.WEIGHTS.listingQuality, rawValue: factors.listingQualityScore, contribution: this.WEIGHTS.listingQuality * factors.listingQualityScore },
      { factor: "sellerTrust", weight: this.WEIGHTS.sellerTrust, rawValue: factors.sellerTrustScore, contribution: this.WEIGHTS.sellerTrust * factors.sellerTrustScore },
      { factor: "recency", weight: this.WEIGHTS.recency, rawValue: factors.recencyScore, contribution: this.WEIGHTS.recency * factors.recencyScore }
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
