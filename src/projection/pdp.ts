import { CompiledSpecificationSet } from '../domain/specification/scgs/types';
import { PartViewModel } from '../viewmodels/pdp.viewmodel';
import { Part, Seller } from '@/types';

export const buildPDPView = (
  part: Part,
  seller: Seller | null,
  compiled: CompiledSpecificationSet
): PartViewModel => {
  return {
    id: part.id,
    title: part.title,
    subtitle: part.subtitle || '',
    price: part.price || 0,
    condition: part.condition || 'Used',
    specifications: compiled.grouped.map(g => ({
      name: g.name,
      displayOrder: g.order,
      specifications: g.items.map(i => ({
        key: i.key,
        label: i.label,
        value: i.value.toString(),
        unit: i.unit,
        displayOrder: i.displayOrder
      }))
    })),
    header: {
      title: part.title,
      subtitle: part.subtitle || '',
      rating: 4.8,
      ratingCount: 128,
      sku: part.trackingNumber || 'N/A',
    },
    images: part.images || [],
    pricing: {
      partPrice: part.price || 0,
      coreCharge: 0,
      isCoreRefundable: false,
      shippingEstimate: 'Free shipping to 12345',
      totalEstimated: (part.price || 0),
    },
    inventory: {
      quantity: 1,
      status: (part.status as any) || 'available',
      isInStock: true,
    },
    seller: {
      id: seller?.id || 'unknown',
      displayName: seller?.name || 'Unknown Seller',
      rating: seller?.rating || 4.8,
      location: seller?.location || 'Unknown',
      responseTime: '24h',
    },
    fitment: {
      confidence: 'high',
      fitmentScore: 100,
      vehicles: (part.compatibility || []).map(v => ({
        year: parseInt(v.years),
        make: v.make,
        model: v.model,
        engine: v.engine
      })),
    },
    badges: {
      isOEM: part.condition === 'NEW',
      isTested: true,
      warrantyIncluded: true,
      isGoodFit: true,
    },
    shipping: {
      isFree: true,
      eta: '2 days',
    },
    description: part.description || '',
    crossSell: [],
    tabs: [
      { id: 'spec', label: 'Specifications', content: 'Specs Data' },
      { id: 'fitment', label: 'Fitment', content: 'Fitment Data' },
    ],
  };
};
