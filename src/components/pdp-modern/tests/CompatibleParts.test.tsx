import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import CompatibleParts from '../CompatibleParts';
import { PartSummaryViewModel } from '@/domain/types/pdp.types';

describe('CompatibleParts', () => {
  const mockCrossSell: PartSummaryViewModel[] = [
    { id: 'p1', title: 'Alternator Pulley', price: 18.99, imageUrl: 'img1.jpg' },
    { id: 'p2', title: 'Alternator Brush Set', price: 14.99, imageUrl: 'img2.jpg' },
  ];

  it('renders cross-sell parts', () => {
    render(<CompatibleParts parts={mockCrossSell} />);
    expect(screen.getByText('Alternator Pulley')).toBeDefined();
    expect(screen.getByText('$18.99')).toBeDefined();
    expect(screen.getByText('Alternator Brush Set')).toBeDefined();
  });
});
