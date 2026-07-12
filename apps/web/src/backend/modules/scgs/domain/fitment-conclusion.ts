/**
 * SCGS Fitment Conclusion
 *
 * Fitment is narrower than compatibility. Compatibility asks "can this part be
 * used?" Fitment asks "can this exact part be installed on this exact vehicle?"
 *
 * @see docs/specifications/marketplace-semantic-model.md Chapter 13
 */

export type FitmentStatus = 'exact' | 'compatible' | 'conditional' | 'incompatible' | 'unknown';

export interface FitmentVehicle {
  year: number;
  make: string;
  model: string;
  engine?: string;
  confidence: number; // 0..1 per vehicle
}

export interface FitmentConclusion {
  status: FitmentStatus;
  fitmentScore: number; // 0..100
  vehicles: FitmentVehicle[];
  notes: string[];
  compiledAt: string; // ISO 8601
}

export interface FitmentCompilerInput {
  compatibility: {
    status: 'compatible' | 'conditional' | 'incompatible' | 'unknown';
    vehicles: Array<{
      year: number;
      make: string;
      model: string;
      engine?: string;
    }>;
  };
  specifications?: Array<{ key: string; value: string | number | boolean }>;
}
