import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import TrustBar from '../TrustBar';

describe('TrustBar', () => {
  it('renders all trust indicators', () => {
    render(<TrustBar />);
    expect(screen.getByText(/Secure Checkout/i)).toBeDefined();
    expect(screen.getByText(/30-Day Returns/i)).toBeDefined();
    expect(screen.getByText(/Warranty Included/i)).toBeDefined();
    expect(screen.getByText(/Support/i)).toBeDefined();
  });
});
