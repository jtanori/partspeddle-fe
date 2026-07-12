import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import RecentlyViewed from '../RecentlyViewed';
import { PartSummaryViewModel } from '@/domain/types/pdp.types';

describe('RecentlyViewed', () => {
  const mockRecent: PartSummaryViewModel[] = [
    { id: 'r1', title: 'Recently Viewed 1', price: 50, imageUrl: 'img1.jpg' },
  ];

  it('renders recently viewed items', () => {
    render(<RecentlyViewed parts={mockRecent} />);
    expect(screen.getByText('Recently Viewed')).toBeDefined();
    expect(screen.getByText('Recently Viewed 1')).toBeDefined();
    expect(screen.getByText('$50.00')).toBeDefined();
  });
});
