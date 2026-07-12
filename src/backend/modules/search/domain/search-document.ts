export interface SearchDocument {
  objectID: string;
  title: string;
  description: string;
  price: number;
  status: string;

  // Facetable Attributes
  make: string;
  model: string;
  year: number | null;

  // Fitment signatures: each value is "makeId:modelId:year" for exact tuple matching.
  fitment_signatures: string[];

  category: string;
  category_label: string;
  part_type: string;
  part_type_label: string;

  condition: string;

  seller_name: string;
  seller_verified: boolean;
  seller_trust_score: number;

  location: string;

  image_url: string | null;
  listing_quality_score: number;
  created_at: number; // Unix timestamp for sorting
}
