import { Part, Seller } from '@/types';
import { PartViewModel } from '../domain/pdp.types';

export class PartViewModelBuilder {
  build(part: Part, seller: Seller | null): PartViewModel {
    return {
      id: part.id,
      header: {
        title: part.title,
        subtitle: part.subtitle || '',
        rating: 4.8,
        ratingCount: 128,
        sku: part.sku || 'N/A',
      },
      images: part.images || [],
      pricing: {
        partPrice: part.price,
        coreCharge: part.coreCharge || 0,
        isCoreRefundable: !!part.coreCharge,
        shippingEstimate: 'Free shipping to 12345',
        totalEstimated: part.price + (part.coreCharge || 0),
      },
      inventory: {
        quantity: part.quantity || 0,
        status: part.status as any || 'available',
        isInStock: (part.quantity || 0) > 0,
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
        vehicles: part.fitment || [],
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
  }
}
