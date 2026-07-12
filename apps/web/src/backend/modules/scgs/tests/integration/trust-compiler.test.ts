import { describe, it, expect } from 'vitest';
import { compileTrustProfile } from '../../infrastructure/trust-compiler';

describe('SCGS compileTrustProfile', () => {
  it('returns high trust for strong signals', () => {
    const profile = compileTrustProfile({
      sellerTrustScore: 0.95,
      listingQualityScore: 0.95,
      rating: 5,
      reviewCount: 200,
      feedbackPercentage: 100,
      verificationStatus: 'verified',
      shipsWithin: '1 day',
      responseTime: '1 hour',
    });

    expect(profile.level).toBe('high');
    expect(profile.score).toBeGreaterThan(0.85);
  });

  it('returns low trust for weak signals', () => {
    const profile = compileTrustProfile({
      sellerTrustScore: 0.1,
      listingQualityScore: 0.1,
      rating: 1,
      reviewCount: 0,
      feedbackPercentage: 50,
    });

    expect(profile.level).toBe('low');
    expect(profile.score).toBeLessThan(0.5);
  });

  it('weighs seller trust and listing quality most heavily', () => {
    const highQuality = compileTrustProfile({
      sellerTrustScore: 0.9,
      listingQualityScore: 0.9,
      rating: 3,
      reviewCount: 5,
      feedbackPercentage: 80,
    });

    const lowQuality = compileTrustProfile({
      sellerTrustScore: 0.2,
      listingQualityScore: 0.2,
      rating: 5,
      reviewCount: 500,
      feedbackPercentage: 100,
    });

    expect(highQuality.score).toBeGreaterThan(lowQuality.score);
  });

  it('normalizes rating out of 5 stars', () => {
    const profile = compileTrustProfile({
      sellerTrustScore: 0.5,
      listingQualityScore: 0.5,
      rating: 2.5,
    });

    const ratingSignal = profile.signals.find((s) => s.name === 'rating');
    expect(ratingSignal?.value).toBe(0.5);
  });

  it('gives higher shipping score for faster shipping', () => {
    const fast = compileTrustProfile({
      sellerTrustScore: 0.5,
      listingQualityScore: 0.5,
      shipsWithin: '1 day',
    });
    const slow = compileTrustProfile({
      sellerTrustScore: 0.5,
      listingQualityScore: 0.5,
      shipsWithin: '14 days',
    });

    const fastSignal = fast.signals.find((s) => s.name === 'shipsWithin');
    const slowSignal = slow.signals.find((s) => s.name === 'shipsWithin');
    expect(fastSignal?.value).toBeGreaterThan(slowSignal?.value as number);
  });
});
