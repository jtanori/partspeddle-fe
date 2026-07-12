import { describe, it, expect } from 'vitest';
import { pdpDataSchema } from '../../contract/pdp-view-model.contract';

const validPDPData = {
  id: 'listing-1',
  title: 'Brake Pad Set',
  subtitle: 'Front ceramic brake pads',
  price: 129.99,
  condition: 'New',
  images: ['https://cdn.example.com/p1.jpg'],
  description: 'High quality ceramic brake pads.',
  header: {
    title: 'Brake Pad Set',
    subtitle: 'Front ceramic brake pads',
    rating: 4.8,
    ratingCount: 42,
    sku: 'BP-12345',
  },
  specifications: [
    {
      name: 'General',
      displayOrder: 0,
      specifications: [{ key: 'material', label: 'Material', value: 'Ceramic', displayOrder: 0 }],
    },
  ],
  pricing: {
    partPrice: 129.99,
    coreCharge: 0,
    isCoreRefundable: false,
    shippingEstimate: 'Free shipping to 12345',
    totalEstimated: 129.99,
  },
  inventory: {
    quantity: 5,
    status: 'available',
    isInStock: true,
  },
  seller: {
    id: 'seller-1',
    displayName: 'Auto Parts Inc.',
    rating: 4.9,
    location: 'Austin, TX',
    responseTime: '24h',
  },
  fitment: {
    confidence: 'high',
    fitmentScore: 100,
    vehicles: [{ year: 2020, make: 'Honda', model: 'Civic', engine: '2.0L' }],
  },
  badges: {
    isOEM: false,
    isTested: true,
    warrantyIncluded: true,
    isGoodFit: true,
  },
  shipping: {
    isFree: true,
    eta: '2 days',
  },
  crossSell: [
    {
      id: 'listing-2',
      title: 'Brake Rotor',
      price: 89.99,
      imageUrl: 'https://cdn.example.com/p2.jpg',
    },
  ],
};

describe('SCGS PDPViewModel contract', () => {
  it('accepts valid PDP data', () => {
    const parsed = pdpDataSchema.parse(validPDPData);
    expect(parsed.id).toBe('listing-1');
    expect(parsed.header.sku).toBe('BP-12345');
    expect(parsed.specifications).toHaveLength(1);
  });

  it('rejects missing required fields', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { header, ...withoutHeader } = validPDPData;
    expect(() => pdpDataSchema.parse(withoutHeader)).toThrow();
  });

  it('rejects invalid nested fields', () => {
    const invalid = {
      ...validPDPData,
      pricing: { ...validPDPData.pricing, partPrice: '129.99' },
    };
    expect(() => pdpDataSchema.parse(invalid)).toThrow();
  });

  it('accepts empty cross-sell and specification lists', () => {
    const minimal = {
      ...validPDPData,
      crossSell: [],
      specifications: [],
    };
    const parsed = pdpDataSchema.parse(minimal);
    expect(parsed.crossSell).toHaveLength(0);
    expect(parsed.specifications).toHaveLength(0);
  });
});
