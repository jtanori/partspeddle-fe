import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import DescriptionFitmentPanel from '../DescriptionFitmentPanel';

describe('DescriptionFitmentPanel', () => {
  const mockPart = {
    description: 'This is a long description'.repeat(20),
    fitment: {
      vehicles: [{ year: 2015, make: 'Honda', model: 'Civic', engine: '1.8L' }]
    }
  };

  it('renders description and fitment', () => {
    render(<DescriptionFitmentPanel description={mockPart.description} fitment={mockPart.fitment} />);
    expect(screen.getByText(/Description/i)).toBeDefined();
    expect(screen.getByText(/Vehicle Fitment/i)).toBeDefined();
    expect(screen.getByText(/2015 Honda Civic/i)).toBeDefined();
  });
});
