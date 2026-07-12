/**
 * Raw semantic specification input passed to the SCGS compiler.
 *
 * This is the boundary object between the application/API layer and the
 * SCGS compilation pipeline. It carries enough context to produce a
 * lineage-aware `CompiledSemanticArtifact`.
 */
export interface SemanticSpecification {
  listingId: string;
  categoryId: string;
  /** Optional explicit version. When omitted the compiler uses a default. */
  version?: string;
  /** Optional raw specification overrides for testing or migration scenarios. */
  overrides?: Record<string, string | number | boolean>;
}
