/**
 * Types & Interfaces for PartsPeddle UI Prototyping
 */

export type PartCondition = 'Excellent' | 'OEM Original' | 'Good' | 'Used OEM' | 'For Parts';

export interface Seller {
  id: string;
  name: string;
  rating: number;
  reviewCount: number;
  location: string;
  specialty?: string;
  partCount: number;
  feedbackPercentage: number;
  shipsWithin: string;
  returnPolicy: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
}

export interface Part {
  id: string; // e.g. "1100428"
  trackingNumber: string; // PP-08311972
  title: string; // "1987 Chevy C10 Alternator"
  subtitle: string; // "Chevy C10 1981-1987"
  system: string; // e.g. "Powertrain", "Suspension & Steering", "Brake System", "Electrical System"
  category: string; // e.g. "Charging & Starting", "Engine System", "Transmission System", "Drivetrain", "Steering"
  partType: string; // "Alternator", "Transmission", "Carburetor", "Door", etc.
  oemPartNumber: string;
  interchangePartNumbers: string[];
  voltage?: string;
  amperage?: string;
  pulleyType?: string;
  connectorType?: string;
  weight?: string;
  location?: string;
  condition: PartCondition;
  price: number;
  originalPrice?: number;
  mileage: number | string; // 87450 or "Unknown"
  fits: string; // "5.0L, 5.7L Engines"
  description: string;
  notes?: string;
  images: string[];
  sellerId: string;
  compatibility: {
    make: string;
    model: string;
    years: string;
    engine: string;
  }[];
  stockNumber?: string;
  dateRemoved?: string;
  vinRemovedFrom?: string;
  views?: number;
  featured?: boolean;
  isAiDraft?: boolean;
  aiConfidence?: number;
  aiPriceRange?: [number, number];
  aiFitmentNotes?: string;
  aiSuggestedDescription?: string;
}

export interface CartItem {
  part: Part;
  quantity: number;
}

export interface Offer {
  id: string;
  partId: string;
  offeredPrice: number;
  message: string;
  status: 'Pending' | 'Accepted' | 'Counter-Offer' | 'Declined';
  replyMessage?: string;
  counterPrice?: number;
  timestamp: string;
}

export interface SearchFilters {
  query: string;
  system: string;
  category: string;
  partTypes: string[];
  priceRange: [number, number];
  conditions: PartCondition[];
  sellerType: 'all' | 'trusted';
  featured?: boolean;
  fitmentMake?: string;
  fitmentModel?: string;
  fitmentYear?: string;
  fitmentEngine?: string;
}

export interface TourStep {
  step: number;
  title: string;
  description: string;
  elementId?: string; // Target element to highlight
}

export interface UserSession {
  email: string | null;
  jwt: string | null;
  aud: string;
  role: string;
}

export interface AIAnalysisResult {
  is_valid_vehicle?: boolean;
  completeness_grade?: 'A' | 'B' | 'C' | 'D' | 'F';
  vehicle_metrics?: {
    year: number;
    make: string;
    model: string;
    vin?: string | null;
  };
  inferred_manifest?: Array<{
    system: string;
    part_type: string;
    estimated_integrity: 'Excellent' | 'Used OEM' | 'Damaged';
  }>;
  part_type?: string;
  system?: string;
  category?: string;
  oem_part_number?: string | null;
  cross_reference_numbers?: string[];
  machinery_compatibility?: string[];
  confidence_scores?: {
    part_type_accuracy: number;
    fitment_accuracy: number;
    number_extraction_accuracy: number;
  };
}

