import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import PDPRoot from '../PDPRoot';
import { PartViewModel } from '@/domain/types/pdp.types';

describe('PDPRoot', () => {
  const mockViewModel: PartViewModel = {
    id: 'p1',
    header: { title: '2015 Honda Civic Alternator', subtitle: '1.8L, 4-Cylinder', rating: 5, ratingCount: 1, sku: 'ALT-11039' },
    images: ['img.jpg'],
    pricing: { partPrice: 89.99, coreCharge: 0, isCoreRefundable: false, shippingEstimate: 'Free shipping', totalEstimated: 89.99 },
    inventory: { quantity: 1, status: 'available', isInStock: true },
    seller: { id: 's1', displayName: 'Test Auto Parts', rating: 4.8, location: 'NC, USA', responseTime: '24h' },
    fitment: { confidence: 'high', fitmentScore: 100, vehicles: [] },
    badges: { isOEM: true, isTested: true, warrantyIncluded: true, isGoodFit: true },
    shipping: { isFree: true, eta: '2 days' },
    description: 'This is a description',
    crossSell: []
  };

  it('renders the layout components', () => {
    render(<PDPRoot viewModel={mockViewModel} />);
    expect(screen.getByText('2015 Honda Civic Alternator')).toBeDefined();
    expect(screen.getByText('ADD TO CART')).toBeDefined();
  });
});
