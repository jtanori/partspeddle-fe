import { SearchFilters, PartCondition } from '@/types';
import { RankedArtifact } from '../infrastructure/ranking-types';
import {
  SearchViewModel,
  SearchResultCardModel,
  FacetViewModel,
  searchViewModelSchema,
} from '../contract/search-view-model.contract';

/**
 * Raw presentation data for a single search result.
 *
 * The SCGS compiler produces semantic artifacts; presentation data (images,
 * price, seller name) comes from the upstream search index. This interface
 * decouples the projection from any specific index shape.
 */
export interface SearchResultPresentation {
  title: string;
  price: number;
  imageUrl?: string;
  subtitle?: string;
  condition?: string;
  sellerName?: string;
  sellerRating?: number;
  sellerReviewCount?: number;
  fitmentSummary?: string;
  badges?: Partial<SearchResultCardModel['badges']>;
  facets?: Record<string, string | number | boolean>;
}

const FACET_LABELS: Record<string, string> = {
  category: 'Category',
  part_type: 'Part Type',
  make: 'Make',
  model: 'Model',
  year: 'Year',
  condition: 'Condition',
  seller_verified: 'Verified Sellers',
  location: 'Location',
};

function normalizeCondition(condition?: string): PartCondition | undefined {
  if (!condition) return undefined;
  const upper = condition.toUpperCase().replace(/\s+/g, '_');
  const valid: PartCondition[] = [
    'NEW',
    'REMANUFACTURED',
    'USED_EXCELLENT',
    'USED_GOOD',
    'USED_FAIR',
    'FOR_PARTS',
  ];
  return valid.find(c => c === upper);
}

function getConditionLabel(condition?: PartCondition): string {
  switch (condition) {
    case 'NEW':
      return 'New';
    case 'REMANUFACTURED':
      return 'Remanufactured';
    case 'USED_EXCELLENT':
      return 'Used - Excellent';
    case 'USED_GOOD':
      return 'Used - Good';
    case 'USED_FAIR':
      return 'Used - Fair';
    case 'FOR_PARTS':
      return 'For Parts';
    default:
      return 'Used';
  }
}

function getConditionColor(condition?: PartCondition): string {
  switch (condition) {
    case 'NEW':
      return 'green';
    case 'REMANUFACTURED':
      return 'blue';
    case 'USED_EXCELLENT':
      return 'emerald';
    case 'USED_GOOD':
      return 'yellow';
    case 'USED_FAIR':
      return 'orange';
    case 'FOR_PARTS':
      return 'red';
    default:
      return 'gray';
  }
}

function formatPrice(value: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(value);
}

function isFacetValueSelected(
  facetKey: string,
  value: string,
  filters: SearchFilters,
): boolean {
  switch (facetKey) {
    case 'category':
      return filters.category === value;
    case 'part_type':
      return filters.partTypes.includes(value);
    case 'make':
      return filters.fitmentMake === value;
    case 'model':
      return filters.fitmentModel === value;
    case 'year':
      return filters.fitmentYear === value;
    case 'condition':
      return filters.conditions.includes(value as PartCondition);
    case 'seller_verified':
      return filters.sellerType === 'trusted' && value === 'true';
    default:
      return false;
  }
}

function mapFacetsToViewModels(
  facets: Record<string, Record<string, number>> | undefined,
  filters: SearchFilters,
): FacetViewModel[] {
  if (!facets) return [];

  return Object.entries(facets).map(([key, values]) => ({
    key,
    label: FACET_LABELS[key] || key,
    values: Object.entries(values)
      .map(([value, count]) => ({
        value,
        count,
        selected: isFacetValueSelected(key, value, filters),
      }))
      .sort((a, b) => b.count - a.count),
  }));
}

function buildResultCard(
  ranked: RankedArtifact,
  presentation?: SearchResultPresentation,
): SearchResultCardModel {
  const artifact = ranked.artifact;
  const compiled = artifact.compiled;
  const factors = compiled.rankingFactors;

  const condition = normalizeCondition(presentation?.condition);
  const listingQuality = factors.listingQuality ?? 0;
  const sellerRating = presentation?.sellerRating ?? 0;
  const sellerVerified = sellerRating >= 4.5;

  return {
    id: artifact.listingId,
    title: presentation?.title ?? artifact.listingId,
    price: formatPrice(presentation?.price ?? 0),
    imageUrl: presentation?.imageUrl,
    subtitle: presentation?.subtitle,
    conditionLabel: getConditionLabel(condition),
    conditionColor: getConditionColor(condition),
    sellerName: presentation?.sellerName,
    sellerRating: presentation?.sellerRating,
    sellerReviewCount: presentation?.sellerReviewCount,
    fitmentSummary: presentation?.fitmentSummary,
    badges: {
      isOEM: condition === 'NEW',
      isTested: sellerVerified || listingQuality >= 0.6,
      isGoodFit: Boolean(presentation?.fitmentSummary),
      ...presentation?.badges,
    },
    facets: presentation?.facets ?? compiled.facets,
  };
}

export interface BuildSearchViewModelInput {
  rankedArtifacts: RankedArtifact[];
  presentations: Record<string, SearchResultPresentation>;
  facets: Record<string, Record<string, number>>;
  filters: SearchFilters;
  page: number;
  pageSize: number;
  total: number;
  query?: string;
  queryMs?: number;
}

/**
 * Application use case: build a validated SCGS SearchViewModel from ranked
 * artifacts and their presentation data.
 */
export function buildSearchViewModel(input: BuildSearchViewModelInput): SearchViewModel {
  const {
    rankedArtifacts,
    presentations,
    facets,
    filters,
    page,
    pageSize,
    total,
    query,
    queryMs,
  } = input;

  const totalPages = Math.ceil(total / pageSize);

  const viewModel: SearchViewModel = {
    results: rankedArtifacts.map(ranked =>
      buildResultCard(ranked, presentations[ranked.artifact.listingId])
    ),
    facets: mapFacetsToViewModels(facets, filters),
    pagination: {
      page,
      pageSize,
      total,
      totalPages,
      hasNext: page + 1 < totalPages,
      hasPrevious: page > 0,
    },
    meta: {
      source: 'SCGS',
      query,
      queryMs,
      rankingVersion: '1.0.0',
      generatedAt: new Date().toISOString(),
    },
  };

  return searchViewModelSchema.parse(viewModel);
}
