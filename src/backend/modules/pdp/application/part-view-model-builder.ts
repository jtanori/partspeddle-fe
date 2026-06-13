import { Part, Seller } from '@/types';
import { PartViewModel } from '../domain/pdp.types';

export class PartViewModelBuilder {
  build(part: Part, seller: Seller | null): PartViewModel {
    return {
      id: part.id,
      title: part.title,
      subtitle: part.subtitle || '',
      images: part.images || [],
      pricing: {
        partPrice: part.price,
        coreCharge: 0, // Need to add to DB schema later
        isCoreRefundable: false,
        shippingEstimate: 'Calculated at checkout',
        totalEstimated: part.price,
      },
      inventory: {
        quantity: 1, // Need to add to DB schema later
        status: 'available',
        isInStock: true,
      },
      seller: {
        id: seller?.id || 'unknown',
        displayName: seller?.name || 'Unknown Seller',
        rating: seller?.rating || 0,
        location: seller?.location || 'Unknown',
        responseTime: '24h',
      },
      fitment: {
        confidence: 'high',
        fitmentScore: 100,
        vehicles: [],
      },
      badges: {
        isOEM: part.condition === 'NEW',
        isTested: true,
        warrantyIncluded: true,
      },
      description: part.description,
    };
  }
}
