/**
 * Types & Interfaces for PartsPeddle UI Prototyping
 */

export type PartCondition =
  | "NEW"
  | "REMANUFACTURED"
  | "USED_EXCELLENT"
  | "USED_GOOD"
  | "USED_FAIR"
  | "FOR_PARTS";

export interface Seller {
  id: string;
  name: string;
  businessName?: string;
  logoUrl?: string;
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
  status?: "draft" | "pending_review" | "available" | "reserved" | "sold" | "removed" | "archived";
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
  seller?: Partial<Seller>;
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
  status: "Pending" | "Accepted" | "Counter-Offer" | "Declined";
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
  sellerType: "all" | "trusted";
  featured?: boolean;
  fitmentMake?: string;
  fitmentModel?: string;
  fitmentYear?: string;
  fitmentEngine?: string;
  page?: number;
  hitsPerPage?: number;
  sortBy?: "price_asc" | "price_desc" | "newest";
  viewMode?: "grid" | "list";
}

export interface TourStep {
  step: number;
  title: string;
  description: string;
  elementId?: string; // Target element to highlight
}

export interface UserSession {
  id: string;
  email: string | null;
  jwt: string | null;
  aud: string;
  role: string;
}

export interface NavbarProps {
  currentView: string;
  onChangeView: (view: string) => void;
  onSearchSubmit: (text: string) => void;
  cartCount: number;
  user: UserSession | null;
  onLogout: () => void;
  onOpenCart: () => void;
  onOpenSearchModal?: (initialQuery?: string) => void;
  searchTextValue?: string;
  onSelectPart?: (partId: string) => void;
  userRole: "buyer" | "seller";
  onChangeUserRole: (role: "buyer" | "seller") => void;
  profile: any;
  onOpenSupport: () => void;
  onOpenTour: () => void;
  onSetSellerTab?: (tab: "listings" | "settings" | "snap") => void;
  onSnapImagesUploaded?: (images: string[]) => void;
  activeSellerTab?: "listings" | "settings" | "snap";
}

export interface AIAnalysisResult {
  is_valid_vehicle?: boolean;
  completeness_grade?: "A" | "B" | "C" | "D" | "F";
  vehicle_metrics?: {
    year: number;
    make: string;
    model: string;
    vin?: string | null;
  };
  inferred_manifest?: Array<{
    system: string;
    part_type: string;
    estimated_integrity: "Excellent" | "Used OEM" | "Damaged";
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

export { DEFAULT_PART_IMAGE as PARTS_FALLBACK_IMAGE } from "@/lib/part-images";
