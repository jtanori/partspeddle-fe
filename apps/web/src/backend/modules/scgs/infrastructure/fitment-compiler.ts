import {
  FitmentConclusion,
  FitmentStatus,
  FitmentVehicle,
  FitmentCompilerInput,
} from '../domain/fitment-conclusion';

function deriveVehicleConfidence(
  vehicle: FitmentCompilerInput['compatibility']['vehicles'][number],
  specs: FitmentCompilerInput['specifications'],
): number {
  let confidence = 0.7;

  if (vehicle.engine) {
    confidence += 0.15;
  }

  const hasSpecs = specs && specs.length > 0;
  if (hasSpecs) {
    confidence += 0.1;
  }

  return Math.min(1, confidence);
}

function deriveStatus(
  compatibilityStatus: FitmentCompilerInput['compatibility']['status'],
  vehicles: FitmentVehicle[],
): FitmentStatus {
  if (compatibilityStatus === 'unknown' || vehicles.length === 0) return 'unknown';
  if (compatibilityStatus === 'incompatible') return 'incompatible';
  if (compatibilityStatus === 'conditional') return 'conditional';

  const allExact = vehicles.every((v) => v.confidence >= 0.9);
  return allExact ? 'exact' : 'compatible';
}

/**
 * Compiles a fitment conclusion from a compatibility conclusion and
 * specification context.
 */
export function compileFitment(input: FitmentCompilerInput): FitmentConclusion {
  const { compatibility, specifications } = input;

  if (compatibility.status === 'unknown' || compatibility.vehicles.length === 0) {
    return {
      status: 'unknown',
      fitmentScore: 0,
      vehicles: [],
      notes: ['Insufficient compatibility data to compute fitment.'],
      compiledAt: new Date().toISOString(),
    };
  }

  const vehicles: FitmentVehicle[] = compatibility.vehicles.map((v) => ({
    year: v.year,
    make: v.make,
    model: v.model,
    engine: v.engine,
    confidence: deriveVehicleConfidence(v, specifications),
  }));

  const status = deriveStatus(compatibility.status, vehicles);
  const averageConfidence = vehicles.reduce((sum, v) => sum + v.confidence, 0) / vehicles.length;
  const fitmentScore = Math.round(averageConfidence * 100);

  const notes: string[] = [];
  if (status === 'exact') {
    notes.push('All compatible vehicles match with high confidence.');
  } else if (status === 'compatible') {
    notes.push('Vehicles are compatible; verify installation details with seller.');
  } else if (status === 'conditional') {
    notes.push('Compatibility is conditional on additional vehicle details.');
  }

  return {
    status,
    fitmentScore,
    vehicles,
    notes,
    compiledAt: new Date().toISOString(),
  };
}
