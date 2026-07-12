import { SpecificationRepository } from '@/repositories/specification.repository';
import { CatalogRepository } from '@/repositories/catalog.repository';
import { ListingRepository } from '@/repositories/listing.repository';
import { SemanticSpecification } from '../domain/semantic-specification';
import { CompiledSemanticArtifact } from '../domain/compiled-semantic-artifact';
import { SpecificationCompilerImpl } from '../infrastructure/specification-compiler';
import type { TrustCompilerInput } from '../domain/trust-profile';
import type { RawCompatibilityEntry } from '../domain/compatibility-conclusion';

export interface CompileListingOptions {
  seller?: TrustCompilerInput;
  compatibility?: {
    entries: RawCompatibilityEntry[];
    partNumber?: string;
    oemPartNumber?: string;
  };
}

/**
 * Application use case: compile a listing into a lineage-aware semantic artifact.
 *
 * This is the primary entry point for SCGS compilation. It orchestrates the
 * infrastructure compiler and enriches the output with lineage metadata,
 * trust profile, compatibility conclusion, and fitment conclusion.
 */
export async function compileListing(
  spec: SemanticSpecification,
  deps: {
    specRepo: SpecificationRepository;
    catalogRepo: CatalogRepository;
    listingRepo: ListingRepository;
  },
  options?: CompileListingOptions,
): Promise<CompiledSemanticArtifact> {
  const compiler = new SpecificationCompilerImpl(deps.specRepo, deps.catalogRepo, deps.listingRepo);

  return compiler.compile({
    listingId: spec.listingId,
    categoryId: spec.categoryId,
    version: spec.version,
    seller: options?.seller,
    compatibility: options?.compatibility,
  });
}
