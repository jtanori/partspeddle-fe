import { CompiledSemanticArtifact } from '../domain/compiled-semantic-artifact';
import {
  PDPViewModel,
  PDPDataModel,
  PDPPartSummaryModel,
  pdpDataSchema,
} from '../contract/pdp-view-model.contract';

/**
 * Presentation data required to render a PDP that is not part of the
 * semantic artifact itself.
 */
export interface PDPViewModelPresentation {
  title: string;
  subtitle?: string;
  price: number;
  condition: string;
  images: string[];
  description: string;
  sku?: string;
  /** @deprecated Compatibility is now compiled into the artifact. */
  compatibility?: Array<{
    make: string;
    model: string;
    years: string;
    engine?: string;
  }>;
  seller: {
    id: string;
    displayName: string;
    rating: number;
    location: string;
    responseTime?: string;
  };
  crossSell?: PDPPartSummaryModel[];
}

export interface BuildPDPViewModelInput {
  artifact: CompiledSemanticArtifact;
  presentation: PDPViewModelPresentation;
}

/**
 * Application use case: build a validated SCGS PDP view model from a compiled
 * semantic artifact and its presentation data.
 */
export function buildPDPViewModel(input: BuildPDPViewModelInput): PDPViewModel {
  const { artifact, presentation } = input;
  const compiled = artifact.compiled;
  const factors = compiled.rankingFactors;
  const fitment = compiled.fitment;

  const isOEM = presentation.condition.toUpperCase() === 'NEW';
  const isTested = factors.sellerTrust >= 0.6 || factors.listingQuality >= 0.6;
  const isGoodFit = fitment.fitmentScore > 50;

  const data: PDPDataModel = {
    id: artifact.listingId,
    title: presentation.title,
    subtitle: presentation.subtitle ?? '',
    price: presentation.price,
    condition: presentation.condition,
    images: presentation.images,
    description: presentation.description,
    header: {
      title: presentation.title,
      subtitle: presentation.subtitle ?? '',
      rating: presentation.seller.rating,
      ratingCount: 0,
      sku: presentation.sku ?? artifact.listingId,
    },
    specifications: compiled.grouped.map((group) => ({
      name: group.name,
      displayOrder: group.order,
      specifications: group.items.map((item) => ({
        key: item.key,
        label: item.label,
        value: item.value,
        unit: item.unit,
        displayOrder: item.displayOrder,
      })),
    })),
    pricing: {
      partPrice: presentation.price,
      coreCharge: 0,
      isCoreRefundable: false,
      shippingEstimate: 'Free shipping to 12345',
      totalEstimated: presentation.price,
    },
    inventory: {
      quantity: 1,
      status: 'available',
      isInStock: true,
    },
    seller: {
      id: presentation.seller.id,
      displayName: presentation.seller.displayName,
      rating: presentation.seller.rating,
      location: presentation.seller.location,
      responseTime: presentation.seller.responseTime ?? '24h',
    },
    fitment: {
      confidence: fitment.status === 'exact' || fitment.status === 'compatible' ? 'high' : 'low',
      fitmentScore: fitment.fitmentScore,
      vehicles: fitment.vehicles.map((v) => ({
        year: v.year,
        make: v.make,
        model: v.model,
        engine: v.engine,
      })),
    },
    badges: {
      isOEM,
      isTested,
      warrantyIncluded: true,
      isGoodFit,
    },
    shipping: {
      isFree: true,
      eta: '2 days',
    },
    crossSell: presentation.crossSell ?? [],
  };

  const validated = pdpDataSchema.parse(data);

  return {
    ...validated,
    tabs: [
      { id: 'spec', label: 'Specifications', content: 'Specs Data' },
      { id: 'fitment', label: 'Fitment', content: 'Fitment Data' },
    ],
  };
}
