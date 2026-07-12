import {
  CompatibilityConclusion,
  CompatibilityStatus,
  CompatibleVehicle,
  CompatibilityCompilerInput,
} from '../domain/compatibility-conclusion';

function parseYearRange(years: string): number[] {
  const cleaned = years.trim();
  const rangeMatch = cleaned.match(/(\d{4})\s*[-–]\s*(\d{4})/);
  if (rangeMatch) {
    const start = parseInt(rangeMatch[1], 10);
    const end = parseInt(rangeMatch[2], 10);
    const result: number[] = [];
    for (let year = start; year <= end; year++) {
      result.push(year);
    }
    return result;
  }

  const singleMatch = cleaned.match(/(\d{4})/);
  if (singleMatch) {
    return [parseInt(singleMatch[1], 10)];
  }

  return [];
}

function normalizeMake(make: string): string {
  return make.trim();
}

function normalizeModel(model: string): string {
  return model.trim();
}

function compileStatus(vehicles: CompatibleVehicle[]): CompatibilityStatus {
  if (vehicles.length === 0) return 'unknown';
  return 'compatible';
}

/**
 * Compiles raw compatibility entries into a canonical CompatibilityConclusion.
 *
 * This is the first stage of semantic fitment: it answers "can this part be
 * used?" The fitment compiler narrows this conclusion further.
 */
export function compileCompatibility(input: CompatibilityCompilerInput): CompatibilityConclusion {
  const { entries } = input;

  if (!entries || entries.length === 0) {
    return {
      status: 'unknown',
      confidence: 0,
      vehicles: [],
      notes: ['No compatibility data provided.'],
      compiledAt: new Date().toISOString(),
    };
  }

  const vehicles: CompatibleVehicle[] = [];
  const notes: string[] = [];

  entries.forEach((entry) => {
    const years = parseYearRange(entry.years);
    if (years.length === 0) {
      notes.push(`Could not parse year range: ${entry.years}`);
      return;
    }

    years.forEach((year) => {
      vehicles.push({
        year,
        make: normalizeMake(entry.make),
        model: normalizeModel(entry.model),
        engine: entry.engine,
      });
    });
  });

  const status = compileStatus(vehicles);
  const confidence = status === 'unknown' ? 0 : Math.min(1, 0.6 + vehicles.length * 0.05);

  if (input.oemPartNumber) {
    notes.push(`OEM reference: ${input.oemPartNumber}`);
  }

  return {
    status,
    confidence,
    vehicles,
    notes,
    compiledAt: new Date().toISOString(),
  };
}

export { parseYearRange };
