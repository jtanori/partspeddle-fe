import { SearchViewModel, SearchResultCardModel } from '../domain/view-models/search';
import {
  getConditionColor,
  getConditionLabel,
  normalizeCondition,
} from '../components/search/utils/condition-utils';
import { mapAlgoliaFacetsToViewModels } from '@/lib/search/map-search-facets';
import { SearchFilters } from '@/types';

function buildFitmentSummary(part: Record<string, unknown>): string {
  if (typeof part.subtitle === 'string' && part.subtitle.trim()) {
    return part.subtitle;
  }

  return [part.year, part.make, part.model].filter(Boolean).join(' ');
}

function buildSellerRating(part: Record<string, unknown>): number {
  const seller = part.seller as { rating?: number } | undefined;

  if (seller && typeof seller.rating === 'number') {
    return seller.rating;
  }

  if (typeof part.seller_trust_score === 'number') {
    return part.seller_trust_score / 20;
  }

  return 0;
}

export function buildSearchResultCard(part: Record<string, unknown>): SearchResultCardModel {
  const condition = normalizeCondition(
    typeof part.condition === 'string' ? part.condition : undefined,
  );
  const seller = part.seller as { verificationStatus?: string; businessName?: string; name?: string; reviewCount?: number } | undefined;
  const sellerVerified =
    part.seller_verified === true ||
    seller?.verificationStatus === 'verified';
  const listingQuality =
    typeof part.listing_quality_score === 'number'
      ? part.listing_quality_score
      : typeof part.listingQualityScore === 'number'
        ? part.listingQualityScore
        : 0;
  const hasFitment =
    (Array.isArray(part.fitment_signatures) && part.fitment_signatures.length > 0) ||
    Boolean(part.fits);

  const categoryLabel =
    typeof part.category_label === 'string'
      ? part.category_label
      : typeof part.category === 'string'
        ? part.category
        : undefined;
  const partTypeLabel =
    typeof part.part_type_label === 'string'
      ? part.part_type_label
      : typeof part.part_type === 'string'
        ? part.part_type
        : undefined;

  const fitmentSummary = buildFitmentSummary(part);

  return {
    id: String(part.id || part.objectID || ''),
    title: String(part.title || ''),
    price: new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(typeof part.price === 'number' ? part.price : 0),
    imageUrl:
      (Array.isArray(part.images) ? part.images[0] : undefined) ||
      (typeof part.image_url === 'string' ? part.image_url : undefined) ||
      (typeof part.image === 'string' ? part.image : undefined),
    subtitle: fitmentSummary || partTypeLabel || categoryLabel,
    fitmentSummary,
    conditionLabel: getConditionLabel(condition),
    conditionColor: getConditionColor(condition),
    sellerName:
      seller?.businessName ||
      seller?.name ||
      (typeof part.seller_name === 'string' ? part.seller_name : undefined) ||
      'N/A',
    sellerRating: buildSellerRating(part),
    sellerReviewCount:
      typeof seller?.reviewCount === 'number' ? seller.reviewCount : 0,
    badges: {
      isOEM: condition === 'NEW',
      isTested: sellerVerified || listingQuality >= 60,
      isGoodFit: hasFitment,
    },
    facets: {
      categorySlug: typeof part.category === 'string' ? part.category : '',
      categoryLabel: categoryLabel || '',
      partTypeSlug: typeof part.part_type === 'string' ? part.part_type : '',
      partTypeLabel: partTypeLabel || '',
      sellerVerified: Boolean(sellerVerified),
      listingQualityScore: listingQuality,
    },
  };
}

export function buildSearchProjection(
  docs: Record<string, unknown>[],
  page: number,
  pageSize: number,
  total: number,
  facetCounts?: Record<string, Record<string, number>>,
  filters?: SearchFilters,
  source: SearchViewModel['meta']['source'] = 'ALGOLIA',
): SearchViewModel {
  return {
    results: docs.map(buildSearchResultCard),
    facets: mapAlgoliaFacetsToViewModels(facetCounts, filters || {
      query: '',
      system: '',
      category: '',
      partTypes: [],
      fitmentMake: 'All Makes',
      fitmentModel: 'All Models',
      fitmentYear: 'All Years',
      fitmentEngine: 'All Engines',
      featured: false,
      priceRange: [0, 10000],
      conditions: [],
      sellerType: 'all',
    }),
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
    meta: {
      source,
    },
  };
}