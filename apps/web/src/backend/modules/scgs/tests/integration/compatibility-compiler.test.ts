import { describe, it, expect } from 'vitest';
import { compileCompatibility } from '../../infrastructure/compatibility-compiler';

describe('SCGS compileCompatibility', () => {
  it('expands a year range into individual vehicle years', () => {
    const conclusion = compileCompatibility({
      entries: [{ make: 'Honda', model: 'Civic', years: '2014-2016', engine: '1.8L' }],
    });

    expect(conclusion.vehicles).toHaveLength(3);
    expect(conclusion.vehicles.map((v) => v.year)).toEqual([2014, 2015, 2016]);
  });

  it('handles a single year string', () => {
    const conclusion = compileCompatibility({
      entries: [{ make: 'Toyota', model: 'Camry', years: '2020' }],
    });

    expect(conclusion.vehicles).toHaveLength(1);
    expect(conclusion.vehicles[0]).toMatchObject({ year: 2020, make: 'Toyota', model: 'Camry' });
  });

  it('normalizes make and model whitespace', () => {
    const conclusion = compileCompatibility({
      entries: [{ make: '  Ford  ', model: '  F-150  ', years: '2021' }],
    });

    expect(conclusion.vehicles[0].make).toBe('Ford');
    expect(conclusion.vehicles[0].model).toBe('F-150');
  });

  it('reports unknown when year parsing fails', () => {
    const conclusion = compileCompatibility({
      entries: [{ make: 'Honda', model: 'Civic', years: 'invalid' }],
    });

    expect(conclusion.status).toBe('unknown');
    expect(conclusion.vehicles).toHaveLength(0);
    expect(conclusion.notes.some((n) => n.includes('Could not parse year range'))).toBe(true);
  });

  it('increases confidence with more compatible vehicles', () => {
    const one = compileCompatibility({
      entries: [{ make: 'Honda', model: 'Civic', years: '2020' }],
    });
    const many = compileCompatibility({
      entries: [{ make: 'Honda', model: 'Civic', years: '2018-2022' }],
    });

    expect(many.confidence).toBeGreaterThan(one.confidence);
  });
});
