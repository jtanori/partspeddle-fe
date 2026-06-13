import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ProductHeader from '../ProductHeader';
import { HeaderViewModel, BadgeViewModel } from '@/domain/types/pdp.types';

describe('ProductHeader', () => {
  const mockHeader: HeaderViewModel = {
    title: '2015 Honda Civic Alternator',
    subtitle: '1.8L, 4-Cylinder',
    rating: 4.5,
    ratingCount: 128,
    sku: 'ALT-11039',
  };

  const mockBadges: BadgeViewModel = {
    isOEM: true,
    isTested: true,
    warrantyIncluded: true,
    isGoodFit: true,
  };

  it('renders the header correctly with all data', () => {
    render(<ProductHeader header={mockHeader} badges={mockBadges} />);
    
    expect(screen.getByText('2015 Honda Civic Alternator')).toBeDefined();
    expect(screen.getByText('1.8L, 4-Cylinder')).toBeDefined();
    expect(screen.getByText('SKU: ALT-11039')).toBeDefined();
    expect(screen.getByText('✓ GOOD FIT')).toBeDefined();
  });
});
