/**
 * SCGS Trust Profile
 *
 * Trust is not a database field. It is a compiled semantic profile produced by
 * the SCGS compiler from seller history, listing quality, and platform signals.
 *
 * @see docs/specifications/marketplace-semantic-model.md Chapter 17
 */

export type TrustLevel = 'high' | 'medium' | 'low' | 'unknown';

export type TrustSignalName =
  | 'sellerTrustScore'
  | 'listingQualityScore'
  | 'rating'
  | 'reviewCount'
  | 'feedbackPercentage'
  | 'verificationStatus'
  | 'shipsWithin'
  | 'responseTime';

export interface TrustSignal {
  name: TrustSignalName;
  value: number | string | boolean;
  weight: number; // 0..1 contribution to the final score
}

export interface TrustProfile {
  score: number; // normalized to [0, 1]
  level: TrustLevel;
  signals: TrustSignal[];
  compiledAt: string; // ISO 8601
}

export interface TrustCompilerInput {
  sellerTrustScore: number;
  listingQualityScore: number;
  rating?: number;
  reviewCount?: number;
  feedbackPercentage?: number;
  verificationStatus?: string;
  shipsWithin?: string;
  responseTime?: string;
}
