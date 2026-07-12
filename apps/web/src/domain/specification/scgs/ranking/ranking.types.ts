export interface RankingFeatureFactors {
  listingQualityScore: number;
  sellerTrustScore: number;
  recencyScore: number;
}

export interface RankingContribution {
  factor: string;
  rawValue: number;
  weight: number;
  contribution: number;
}

export interface RankingExplanation {
  finalScore: number;
  contributions: RankingContribution[];
}

export interface RankedResult {
  listingId: string;
  score: number;
  explanation: RankingExplanation;
}
