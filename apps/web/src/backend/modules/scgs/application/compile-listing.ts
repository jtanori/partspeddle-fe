import { SpecificationRepository } from '@/repositories/specification.repository';
import { CatalogRepository } from '@/repositories/catalog.repository';
import { ListingRepository } from '@/repositories/listing.repository';
import { SemanticSpecification } from '../domain/semantic-specification';
import { CompiledSemanticArtifact } from '../domain/compiled-semantic-artifact';
import { SpecificationCompilerImpl } from '../infrastructure/specification-compiler';

/**
 * Application use case: compile a listing into a lineage-aware semantic artifact.
 *
 * This is the primary entry point for SCGS compilation. It orchestrates the
 * infrastructure compiler and enriches the output with lineage metadata.
 */
export async function compileListing(
  spec: SemanticSpecification,
  deps: {
    specRepo: SpecificationRepository;
    catalogRepo: CatalogRepository;
    listingRepo: ListingRepository;
  }
): Promise<CompiledSemanticArtifact> {
  const compiler = new SpecificationCompilerImpl(
    deps.specRepo,
    deps.catalogRepo,
    deps.listingRepo
  );

  return compiler.compile({
    listingId: spec.listingId,
    categoryId: spec.categoryId,
    version: spec.version,
  });
}
