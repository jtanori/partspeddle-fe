# Search Document Contract (V1)

**Goal**: Define the canonical contract between the Catalog and Algolia/Search.

```ts
interface MarketplaceSearchDocument {
  objectID: string;
  documentType: 'PART' | 'DONOR_VEHICLE';
  title: string;
  subtitle?: string;
  price: number;
  sellerId: string;
  categorySlug: string;
  
  // Flattened Specs for Algolia facets
  facets: Record<string, string | number>; 
  
  // Metadata for ranking
  updatedAt: string;
}

interface PartSearchDocument extends MarketplaceSearchDocument {
  documentType: 'PART';
  partNumber: string;
  condition: string;
}

interface DonorVehicleSearchDocument extends MarketplaceSearchDocument {
  documentType: 'DONOR_VEHICLE';
  vin: string;
  mileage: number;
}
```
