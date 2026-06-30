import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import SellerSupportCard from '../SellerSupportCard';
import { SellerViewModel } from '@/domain/types/pdp.types';

describe('SellerSupportCard', () => {
  const mockSeller: SellerViewModel = {
    id: 'seller-1',
    displayName: 'Test Auto Parts',
    rating: 4.8,
    location: 'NC, USA',
    responseTime: '24h',
  };

  it('renders seller info correctly', () => {
    render(<SellerSupportCard seller={mockSeller} />);
    expect(screen.getByText('Test Auto Parts')).toBeDefined();
    expect(screen.getByText(/Ships from/i)).toBeDefined();
    expect(screen.getByText('NC, USA')).toBeDefined();
  });
});
