export interface SearchDocument {
  objectID: string;

  partId: string;

  title: string;
  description: string;

  price: number;

  condition: string;

  makeNames: string[];
  makeIds: string[];
  modelNames: string[];
  modelIds: string[];
  years: number[];

  categoryName: string;
  categoryId: string;
  partTypeName: string;
  partTypeId: string;

  sellerVerified: boolean;

  sellerTrustScore: number;

  imageCount: number;

  listingQualityScore: number;

  createdAt: string;
}
