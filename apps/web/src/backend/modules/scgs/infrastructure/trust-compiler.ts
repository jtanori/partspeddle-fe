import { TrustProfile, TrustLevel, TrustCompilerInput, TrustSignal } from '../domain/trust-profile';

function clamp(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function deriveLevel(score: number): TrustLevel {
  if (score >= 0.8) return 'high';
  if (score >= 0.5) return 'medium';
  if (score > 0) return 'low';
  return 'unknown';
}

function parseShipWithin(value: string | undefined): number {
  if (!value) return 0.5;
  const match = value.match(/(\d+)/);
  if (!match) return 0.5;
  const days = parseInt(match[1], 10);
  if (days <= 1) return 1.0;
  if (days <= 3) return 0.8;
  if (days <= 7) return 0.6;
  return 0.4;
}

function parseResponseTime(value: string | undefined): number {
  if (!value) return 0.5;
  const match = value.match(/(\d+)/);
  if (!match) return 0.5;
  const hours = parseInt(match[1], 10);
  if (hours <= 1) return 1.0;
  if (hours <= 4) return 0.8;
  if (hours <= 24) return 0.6;
  return 0.4;
}

/**
 * Compiles a normalized trust profile from available seller and listing signals.
 *
 * The compiler is intentionally defensive: missing signals receive neutral
 * weights so the profile degrades gracefully rather than failing.
 */
export function compileTrustProfile(input: TrustCompilerInput): TrustProfile {
  const signals: TrustSignal[] = [];

  const sellerTrust = clamp(input.sellerTrustScore ?? 0.5);
  signals.push({
    name: 'sellerTrustScore',
    value: sellerTrust,
    weight: 0.35,
  });

  const listingQuality = clamp(input.listingQualityScore ?? 0.5);
  signals.push({
    name: 'listingQualityScore',
    value: listingQuality,
    weight: 0.25,
  });

  const rating = clamp(input.rating === undefined ? 0.5 : input.rating / 5);
  signals.push({
    name: 'rating',
    value: rating,
    weight: 0.15,
  });

  const reviewCountScore = clamp(
    input.reviewCount === undefined ? 0.5 : Math.log1p(input.reviewCount) / Math.log1p(100),
  );
  signals.push({
    name: 'reviewCount',
    value: reviewCountScore,
    weight: 0.1,
  });

  const feedback = clamp(
    input.feedbackPercentage === undefined ? 0.5 : input.feedbackPercentage / 100,
  );
  signals.push({
    name: 'feedbackPercentage',
    value: feedback,
    weight: 0.1,
  });

  const verification = input.verificationStatus?.toLowerCase() === 'verified' ? 1 : 0.5;
  signals.push({
    name: 'verificationStatus',
    value: verification,
    weight: 0.05,
  });

  const shipping = parseShipWithin(input.shipsWithin);
  signals.push({
    name: 'shipsWithin',
    value: shipping,
    weight: 0.05,
  });

  const response = parseResponseTime(input.responseTime);
  signals.push({
    name: 'responseTime',
    value: response,
    weight: 0.05,
  });

  const totalWeight = signals.reduce((sum, s) => sum + s.weight, 0);
  const score =
    totalWeight > 0
      ? signals.reduce((sum, s) => sum + (s.value as number) * s.weight, 0) / totalWeight
      : 0.5;

  return {
    score: clamp(score),
    level: deriveLevel(score),
    signals,
    compiledAt: new Date().toISOString(),
  };
}
