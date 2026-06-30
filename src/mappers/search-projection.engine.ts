import { MarketplaceListing } from '../domain/marketplace.types';
import { MarketplaceSearchDocument } from '../domain/types/search.types';
import { SpecificationCompiler } from '../domain/services/specification.compiler';

/**
 * P4.2: Domain Projection Engine
 * Transforms MarketplaceListing into MarketplaceSearchDocument 
 * using the canonical SpecificationCompiler.
 */
export async function projectToSearchDocument(
  listing: MarketplaceListing,
  compiler: SpecificationCompiler
): Promise<MarketplaceSearchDocument> {
  const compiled = await compiler.compile({ listingId: listing.id, categoryId: listing.categoryId });

  return {
    objectID: listing.id,
    documentType: listing.listingType,
    title: listing.title,
    subtitle: listing.description.substring(0, 50),
    price: listing.pricing.askingPrice,
    sellerId: listing.sellerId,
    categorySlug: listing.categoryId, 
    facets: compiled.facets,
    updatedAt: listing.createdAt
  };
}
