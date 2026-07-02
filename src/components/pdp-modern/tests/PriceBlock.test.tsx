import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import PriceBlock from '../PriceBlock';
import { PricingViewModel } from '@/domain/types/pdp.types';

describe('PriceBlock', () => {
  const mockPricing: PricingViewModel = {
    partPrice: 89.99,
    coreCharge: 30.00,
    isCoreRefundable: true,
    shippingEstimate: 'Free shipping to 12345',
    totalEstimated: 119.99,
  };

  it('renders the price correctly', () => {
    render(<PriceBlock pricing={mockPricing} onAddToCart={() => {}} />);
    expect(screen.getByText('$89.99')).toBeDefined();
  });

  it('renders core charge when present', () => {
    render(<PriceBlock pricing={mockPricing} onAddToCart={() => {}} />);
    // Check for the specific element containing the core charge amount and text
    const coreChargeElement = screen.getByText((_content, element) => {
      return (
        element?.tagName === "P" &&
        Boolean(element.textContent?.includes("Core Charge")) &&
        Boolean(element.textContent?.includes("$30.00"))
      );
    });
    expect(coreChargeElement).toBeDefined();
  });
});
