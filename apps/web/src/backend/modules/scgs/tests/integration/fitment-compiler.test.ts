import { describe, it, expect } from 'vitest';
import { compileFitment } from '../../infrastructure/fitment-compiler';

describe('SCGS compileFitment', () => {
  it('returns exact fitment when engine and specs are present', () => {
    const conclusion = compileFitment({
      compatibility: {
        status: 'compatible',
        vehicles: [{ year: 2020, make: 'Honda', model: 'Civic', engine: '2.0L' }],
      },
      specifications: [
        { key: 'material', value: 'Ceramic' },
        { key: 'connectorType', value: 'OEM' },
      ],
    });

    expect(conclusion.status).toBe('exact');
    expect(conclusion.fitmentScore).toBeGreaterThan(80);
  });

  it('returns compatible when engine is missing but specs exist', () => {
    const conclusion = compileFitment({
      compatibility: {
        status: 'compatible',
        vehicles: [{ year: 2020, make: 'Honda', model: 'Civic' }],
      },
      specifications: [{ key: 'material', value: 'Ceramic' }],
    });

    expect(conclusion.status).toBe('compatible');
  });

  it('returns conditional when compatibility is conditional', () => {
    const conclusion = compileFitment({
      compatibility: {
        status: 'conditional',
        vehicles: [{ year: 2020, make: 'Honda', model: 'Civic' }],
      },
    });

    expect(conclusion.status).toBe('conditional');
  });

  it('returns unknown when compatibility is unknown', () => {
    const conclusion = compileFitment({
      compatibility: { status: 'unknown', vehicles: [] },
    });

    expect(conclusion.status).toBe('unknown');
    expect(conclusion.fitmentScore).toBe(0);
  });

  it('computes per-vehicle confidence', () => {
    const conclusion = compileFitment({
      compatibility: {
        status: 'compatible',
        vehicles: [
          { year: 2020, make: 'Honda', model: 'Civic', engine: '2.0L' },
          { year: 2020, make: 'Honda', model: 'Civic' },
        ],
      },
      specifications: [{ key: 'material', value: 'Ceramic' }],
    });

    const withEngine = conclusion.vehicles.find((v) => v.engine === '2.0L');
    const withoutEngine = conclusion.vehicles.find((v) => !v.engine);
    expect(withEngine?.confidence).toBeGreaterThan(withoutEngine?.confidence ?? 0);
  });
});
