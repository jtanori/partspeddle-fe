import { MarketplaceSearchDocument } from '../domain/types/search.types';
import { SearchViewModel, SearchResultCardModel } from '../domain/view-models/search';
import { Part } from '@/types';
import {
  getConditionColor,
  getConditionLabel,
  normalizeCondition,
} from '../components/search/utils/condition-utils';

export function buildSearchResultCard(part: any): SearchResultCardModel {
  const condition = normalizeCondition(part.condition);
  const sellerVerified =
    part.seller_verified === true ||
    part.seller?.verificationStatus === 'verified';
  const listingQuality =
    typeof part.listing_quality_score === 'number'
      ? part.listing_quality_score
      : typeof part.listingQualityScore === 'number'
        ? part.listingQualityScore
        : 0;
  const hasFitment =
    Array.isArray(part.fitment_signatures) && part.fitment_signatures.length > 0;

  return {
    id: part.id || part.objectID,
    title: part.title,
    price: new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
      }).format(part.price || 0),
    imageUrl: part.images?.[0] || part.image_url || part.image,
    subtitle: part.subtitle || part.documentType,
    conditionLabel: getConditionLabel(condition),
    conditionColor: getConditionColor(condition),
    sellerName:
      part.seller?.businessName ||
      part.seller?.name ||
      part.seller_name ||
      "N/A",
    sellerRating: part.seller?.rating || 0,
    sellerReviewCount: part.seller?.reviewCount || 0,
    badges: {
      isOEM: condition === 'NEW',
      isTested: sellerVerified || listingQuality >= 60,
      isGoodFit: hasFitment || Boolean(part.fits),
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
