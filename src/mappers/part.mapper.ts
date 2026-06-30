import { PartListing } from '../domain/marketplace.types';
import { PartViewModel } from '../viewmodels/pdp.viewmodel';
import { SpecificationCompiler } from '../domain/services/specification.compiler';

export async function mapPartToViewModel(
  listing: PartListing,
  compiler: SpecificationCompiler
): Promise<PartViewModel> {
  const compiled = await compiler.compile({ listingId: listing.id, categoryId: listing.categoryId });

  return {
    id: listing.id,
    title: listing.title,
    subtitle: listing.partNumber,
    price: listing.pricing.askingPrice,
    condition: listing.inventory.condition,
    specifications: compiled.grouped.map(g => ({
      name: g.name,
      displayOrder: g.order,
      specifications: g.items.map(i => ({
        key: i.key,
        label: i.label,
        value: i.value.toString(),
        unit: i.unit,
        displayOrder: i.displayOrder
      }))
    }))
  };
}
