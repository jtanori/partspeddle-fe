import { describe, it, expect } from 'vitest';
import { compileCompatibility } from '../../infrastructure/compatibility-compiler';

describe('SCGS CompatibilityConclusion contract', () => {
  it('returns compatible status with parsed vehicles', () => {
    const conclusion = compileCompatibility({
      entries: [{ make: 'Honda', model: 'Civic', years: '2014-2015', engine: '1.8L' }],
      oemPartNumber: 'ABC123',
    });

    expect(conclusion.status).toBe('compatible');
    expect(conclusion.vehicles).toHaveLength(2);
    expect(conclusion.vehicles[0]).toMatchObject({
      year: 2014,
      make: 'Honda',
      model: 'Civic',
      engine: '1.8L',
    });
    expect(conclusion.confidence).toBeGreaterThan(0);
  });

  it('returns unknown status when no entries are provided', () => {
    const conclusion = compileCompatibility({ entries: [] });

    expect(conclusion.status).toBe('unknown');
    expect(conclusion.vehicles).toHaveLength(0);
    expect(conclusion.confidence).toBe(0);
  });

  it('records parsed OEM reference in notes', () => {
    const conclusion = compileCompatibility({
      entries: [{ make: 'Honda', model: 'Civic', years: '2020', engine: '2.0L' }],
      oemPartNumber: 'OEM-123',
    });

    expect(conclusion.notes).toContain('OEM reference: OEM-123');
  });

  it('records compilation timestamp', () => {
    const before = Date.now();
    const conclusion = compileCompatibility({ entries: [] });
    const after = Date.now();

    const compiledAtMs = new Date(conclusion.compiledAt).getTime();
    expect(compiledAtMs).toBeGreaterThanOrEqual(before);
    expect(compiledAtMs).toBeLessThanOrEqual(after);
  });
});
