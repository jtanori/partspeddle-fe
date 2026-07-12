import { SpecificationRepository } from '@/repositories/specification.repository';
import { CatalogRepository } from '@/repositories/catalog.repository';
import { ListingRepository } from '@/repositories/listing.repository';
import { SemanticSpecification } from '../domain/semantic-specification';
import { CompiledSemanticArtifact } from '../domain/compiled-semantic-artifact';
import { SpecificationCompilerImpl } from '../infrastructure/specification-compiler';
import { CatalogSpecificationFrameworkRepository } from '../infrastructure/catalog-specification-framework-repository';
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
 * This is the primary entry point for SCGS compilation. It wires the catalog
 * and specification repositories into the SCGS specification framework
 * repository adapter, then invokes the infrastructure compiler.
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
  const frameworkRepo = new CatalogSpecificationFrameworkRepository(
    deps.catalogRepo,
    deps.specRepo,
  );
  const compiler = new SpecificationCompilerImpl(frameworkRepo, deps.listingRepo);

  return compiler.compile({
    listingId: spec.listingId,
    categoryId: spec.categoryId,
    version: spec.version,
    seller: options?.seller,
    compatibility: options?.compatibility,
  });
}
