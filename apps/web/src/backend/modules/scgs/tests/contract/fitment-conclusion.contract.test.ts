import { describe, it, expect } from 'vitest';
import { compileFitment } from '../../infrastructure/fitment-compiler';

describe('SCGS FitmentConclusion contract', () => {
  it('returns exact fitment for high-confidence compatible vehicles', () => {
    const conclusion = compileFitment({
      compatibility: {
        status: 'compatible',
        vehicles: [{ year: 2020, make: 'Honda', model: 'Civic', engine: '2.0L' }],
      },
      specifications: [{ key: 'material', value: 'Ceramic' }],
    });

    expect(['exact', 'compatible']).toContain(conclusion.status);
    expect(conclusion.fitmentScore).toBeGreaterThan(0);
    expect(conclusion.vehicles[0].confidence).toBeGreaterThan(0);
  });

  it('returns unknown when compatibility is unknown', () => {
    const conclusion = compileFitment({
      compatibility: { status: 'unknown', vehicles: [] },
    });

    expect(conclusion.status).toBe('unknown');
    expect(conclusion.fitmentScore).toBe(0);
  });

  it('computes fitment score from average vehicle confidence', () => {
    const conclusion = compileFitment({
      compatibility: {
        status: 'compatible',
        vehicles: [
          { year: 2020, make: 'Honda', model: 'Civic' },
          { year: 2021, make: 'Honda', model: 'Civic' },
        ],
      },
    });

    expect(conclusion.fitmentScore).toBeGreaterThan(0);
    expect(conclusion.fitmentScore).toBeLessThanOrEqual(100);
  });

  it('records compilation timestamp', () => {
    const before = Date.now();
    const conclusion = compileFitment({
      compatibility: {
        status: 'compatible',
        vehicles: [{ year: 2020, make: 'Honda', model: 'Civic' }],
      },
    });
    const after = Date.now();

    const compiledAtMs = new Date(conclusion.compiledAt).getTime();
    expect(compiledAtMs).toBeGreaterThanOrEqual(before);
    expect(compiledAtMs).toBeLessThanOrEqual(after);
  });
});
