import { describe, it, expect } from 'vitest';
import { compileTrustProfile } from '../../infrastructure/trust-compiler';

describe('SCGS TrustProfile contract', () => {
  it('returns a normalized score between 0 and 1', () => {
    const profile = compileTrustProfile({
      sellerTrustScore: 0.9,
      listingQualityScore: 0.9,
      rating: 4.8,
      reviewCount: 50,
      feedbackPercentage: 98,
      verificationStatus: 'verified',
      shipsWithin: '1 day',
      responseTime: '1 hour',
    });

    expect(profile.score).toBeGreaterThanOrEqual(0);
    expect(profile.score).toBeLessThanOrEqual(1);
    expect(['high', 'medium', 'low', 'unknown']).toContain(profile.level);
  });

  it('includes all expected signals', () => {
    const profile = compileTrustProfile({
      sellerTrustScore: 0.5,
      listingQualityScore: 0.5,
    });

    const signalNames = profile.signals.map((s) => s.name);
    expect(signalNames).toContain('sellerTrustScore');
    expect(signalNames).toContain('listingQualityScore');
    expect(signalNames).toContain('rating');
    expect(signalNames).toContain('reviewCount');
  });

  it('degrades gracefully when optional signals are missing', () => {
    const profile = compileTrustProfile({
      sellerTrustScore: 0.5,
      listingQualityScore: 0.5,
    });

    expect(profile.score).toBeGreaterThan(0);
    expect(profile.level).toBe('medium');
  });

  it('records compilation timestamp', () => {
    const before = Date.now();
    const profile = compileTrustProfile({ sellerTrustScore: 0.5, listingQualityScore: 0.5 });
    const after = Date.now();

    const compiledAtMs = new Date(profile.compiledAt).getTime();
    expect(compiledAtMs).toBeGreaterThanOrEqual(before);
    expect(compiledAtMs).toBeLessThanOrEqual(after);
  });
});
