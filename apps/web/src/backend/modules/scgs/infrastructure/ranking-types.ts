import { CompiledSemanticArtifact } from '../domain/compiled-semantic-artifact';

export interface RankingFeatureFactors {
  listingQualityScore: number;
  sellerTrustScore: number;
  recencyScore: number;
  imageQualityScore?: number;
  inventoryCompletenessScore?: number;
  popularityScore?: number;
  responseRateScore?: number;
  conversionScore?: number;
}

export interface RankingContribution {
  factor: string;
  rawValue: number;
  normalizedValue: number;
  weight: number;
  contribution: number;
  explanation: string;
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

export interface RankedArtifact {
  artifact: CompiledSemanticArtifact;
  result: RankedResult;
}
