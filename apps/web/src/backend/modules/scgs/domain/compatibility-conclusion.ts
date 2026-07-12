/**
 * SCGS Compatibility Conclusion
 *
 * Compatibility is not a relationship. It is a semantic conclusion produced by
 * the SCGS compiler from Vehicle + Part + Specifications + OEM references.
 *
 * @see docs/specifications/marketplace-semantic-model.md Chapter 12
 */

export type CompatibilityStatus = 'compatible' | 'conditional' | 'incompatible' | 'unknown';

export interface CompatibleVehicle {
  year: number;
  make: string;
  model: string;
  engine?: string;
  generation?: string;
  trim?: string;
}

export interface CompatibilityConclusion {
  status: CompatibilityStatus;
  confidence: number; // 0..1
  vehicles: CompatibleVehicle[];
  notes: string[];
  compiledAt: string; // ISO 8601
}

export interface RawCompatibilityEntry {
  make: string;
  model: string;
  years: string; // e.g. "2014-2015" or "2020"
  engine?: string;
}

export interface CompatibilityCompilerInput {
  entries: RawCompatibilityEntry[];
  partNumber?: string;
  oemPartNumber?: string;
  specifications?: Array<{ key: string; value: string | number | boolean }>;
}
