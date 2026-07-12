import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import PDPRoot from '../PDPRoot';
import { PartViewModel } from '@/domain/types/pdp.types';

describe('PDPRoot', () => {
  const mockViewModel: PartViewModel = {
    id: 'p1',
    title: '2015 Honda Civic Alternator',
    subtitle: '1.8L, 4-Cylinder',
    price: 89.99,
    condition: 'Used',
    specifications: [],
    header: { title: '2015 Honda Civic Alternator', subtitle: '1.8L, 4-Cylinder', rating: 5, ratingCount: 1, sku: 'ALT-11039' },
    images: ['img.jpg'],
    pricing: { partPrice: 89.99, coreCharge: 0, isCoreRefundable: false, shippingEstimate: 'Free shipping', totalEstimated: 89.99 },
    inventory: { quantity: 1, status: 'available', isInStock: true },
    seller: { id: 's1', displayName: 'Test Auto Parts', rating: 4.8, location: 'NC, USA', responseTime: '24h' },
    fitment: { confidence: 'high', fitmentScore: 100, vehicles: [] },
    badges: { isOEM: true, isTested: true, warrantyIncluded: true, isGoodFit: true },
    shipping: { isFree: true, eta: '2 days' },
    description: 'This is a description',
    crossSell: [],
    tabs: [
      { id: 'spec', label: 'Specifications', content: 'Spec content' },
      { id: 'fit', label: 'Fitment', content: 'Fitment content' }
    ]
  };

  it('renders the layout components', () => {
    render(<PDPRoot viewModel={mockViewModel} />);
    // Title appears in breadcrumbs and h1
    const titles = screen.getAllByText('2015 Honda Civic Alternator');
    expect(titles.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('ADD TO CART')).toBeDefined();
    expect(screen.getByText('BUY NOW')).toBeDefined();
  });
});
