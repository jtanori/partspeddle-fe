export type DraftModule =
  | 'identification'
  | 'media'
  | 'fitment'
  | 'pricing'
  | 'shipping'
  | 'seo';

export interface DraftIdentification {
  title: string;
  description: string;
  system: string;
  category: string;
  partType: string;
  brand: string;
  model: string;
  oemPartNumber: string;
  stockNumber: string;
}

export interface DraftMediaImage {
  id: string;
  fileName: string;
  publicUrl: string;
  isPrimary: boolean;
}

export interface DraftMedia {
  images: DraftMediaImage[];
  mode: 'vehicle' | 'component';
  aiData: DraftAIResult | null;
}

export interface DraftFitmentVehicle {
  vehicleVariantId: string;
  notes: string;
}

export interface DraftFitment {
  vehicles: DraftFitmentVehicle[];
}

export type PartCondition =
  | 'NEW'
  | 'REMANUFACTURED'
  | 'USED_EXCELLENT'
  | 'USED_GOOD'
  | 'USED_FAIR'
  | 'FOR_PARTS';

export interface DraftPricing {
  priceMXN: number;
  condition: PartCondition;
}

export interface DraftShipping {
  method: string;
  costEstimateMXN: number | null;
  notes: string;
}

export interface DraftSEO {
  searchableText: string;
  tags: string[];
}

export interface DraftAIResult {
  title?: string;
  description?: string;
  system?: string;
  category?: string;
  partType?: string;
  brand?: string;
  model?: string;
  oemPartNumber?: string;
  confidenceScores?: {
    partTypeAccuracy?: number;
  };
  [key: string]: unknown;
}

export interface DraftPayload {
  identification: DraftIdentification;
  media: DraftMedia;
  fitment: DraftFitment;
  pricing: DraftPricing;
  shipping: DraftShipping;
  seo: DraftSEO;
  aiData: DraftAIResult | null;
}

export interface DraftCompletion {
  identification: number;
  media: number;
  fitment: number;
  pricing: number;
  shipping: number;
  seo: number;
  total: number;
}

export interface ListingDraft {
  id: string;
  sellerId: string;
  status: 'draft' | 'publishing' | 'published' | 'discarded';
  payload: DraftPayload;
  completionScore: number;
  marketValueEstimate: number | null;
  suggestedPrice: number | null;
  publishedPartId: string | null;
  createdAt: string;
  updatedAt: string;
}

export const DEFAULT_DRAFT_PAYLOAD: DraftPayload = {
  identification: {
    title: '',
    description: '',
    system: '',
    category: '',
    partType: '',
    brand: '',
    model: '',
    oemPartNumber: '',
    stockNumber: '',
  },
  media: {
    images: [],
    mode: 'component',
    aiData: null,
  },
  fitment: {
    vehicles: [],
  },
  pricing: {
    priceMXN: 0,
    condition: 'USED_GOOD',
  },
  shipping: {
    method: '',
    costEstimateMXN: null,
    notes: '',
  },
  seo: {
    searchableText: '',
    tags: [],
  },
  aiData: null,
};
