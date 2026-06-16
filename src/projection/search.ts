import { MarketplaceSearchDocument } from '../domain/types/search.types';
import { SearchViewModel, SearchResultCardModel } from '../domain/view-models/search';
import { Part } from '@/types';
import { getConditionLabel } from '../components/search/utils/condition-utils';

export function buildSearchResultCard(part: any): SearchResultCardModel {
  return {
    id: part.id || part.objectID,
    title: part.title,
    price: new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
      }).format(part.price || 0),
    imageUrl: part.images?.[0] || part.image,
    subtitle: part.subtitle || part.documentType,
    conditionLabel: getConditionLabel(part.condition),
    conditionColor: 'bg-zinc-100', // Simplified
    sellerName: part.seller?.businessName || part.seller?.name || "N/A",
    sellerRating: part.seller?.rating || 0,
    sellerReviewCount: part.seller?.reviewCount || 0,
    badges: {
      isOEM: part.condition === 'NEW',
      isTested: true,
      isGoodFit: true,
    },
    facets: part.facets || {},
  };
}

export function buildSearchProjection(
  docs: any[],
  page: number,
  pageSize: number,
  total: number
): SearchViewModel {
  return {
    results: docs.map(buildSearchResultCard),
    facets: [], 
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
    meta: {
      source: "ALGOLIA",
    },
  };
}
