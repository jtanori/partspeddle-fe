import { describe, it, expect } from 'vitest';
import { parseQueryIntent } from '../../infrastructure/query-intent-parser';

describe('parseQueryIntent', () => {
  it('classifies a VIN', () => {
    const vin = '1HGCM82633A123456';
    const intent = parseQueryIntent(vin);
    expect(intent.type).toBe('VIN');
    expect(intent.entities.vin).toBe(vin);
  });

  it('classifies an OEM part number', () => {
    const intent = parseQueryIntent('BP4K-34-350E');
    expect(intent.type).toBe('OEM_PART_NUMBER');
    expect(intent.entities.oemPartNumber).toBe('BP4K-34-350E');
  });

  it('classifies YMM intent', () => {
    const intent = parseQueryIntent('2015 Honda Accord brake pads');
    expect(intent.type).toBe('YMM');
    expect(intent.entities.vehicle?.year).toBe(2015);
    expect(intent.entities.vehicle?.make).toBe('Honda');
    expect(intent.entities.vehicle?.model).toBe('Accord brake pads');
  });

  it('falls back to part name', () => {
    const intent = parseQueryIntent('brake pads');
    expect(intent.type).toBe('PART_NAME');
    expect(intent.entities.partName).toBe('brake pads');
  });

  it('normalizes extra whitespace', () => {
    const intent = parseQueryIntent('  2015   Honda   Accord  ');
    expect(intent.type).toBe('YMM');
    expect(intent.raw).toBe('2015 Honda Accord');
  });
});
