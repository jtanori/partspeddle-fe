import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import TrustSummaryStrip from '../TrustSummaryStrip';

describe('TrustSummaryStrip', () => {
  it('renders all trust signals', () => {
    render(<TrustSummaryStrip />);
    expect(screen.getByText(/Seller Rating/i)).toBeDefined();
    expect(screen.getByText(/Ships From/i)).toBeDefined();
    expect(screen.getByText(/Est. Delivery/i)).toBeDefined();
    expect(screen.getByText(/Returns/i)).toBeDefined();
  });
});
