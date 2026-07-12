import { SearchResultCardModel } from '@/domain/view-models/search';
import { PartCardPart } from '@/components/design-system/part-card';
import { resolvePartImageUrl } from '@/lib/part-images';

/**
 * Adapt a search result card model to the canonical PartCardPart shape.
 * Parses the localized MXN price string back to a numeric value.
 */
export function toPartCardPart(card: SearchResultCardModel): PartCardPart {
  const numericPrice = Number(card.price.replace(/[^0-9.-]+/g, '')) || 0;

  return {
    id: card.id,
    title: card.title,
    subtitle: card.subtitle || card.fitmentSummary,
    price: numericPrice,
    imageUrl: resolvePartImageUrl(card.imageUrl),
    condition: card.conditionLabel,
    system: undefined,
    sellerName: card.sellerName,
    sellerRating: card.sellerRating,
    sellerReviewCount: card.sellerReviewCount,
  };
}
