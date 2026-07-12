import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ProductGallery from '../ProductGallery';

describe('ProductGallery', () => {
  const mockImages = [
    'https://img1.com',
    'https://img2.com',
    'https://img3.com',
    'https://img4.com',
    'https://img5.com',
  ];

  it('renders the thumbnail rail with an overflow badge', () => {
    render(<ProductGallery images={mockImages} />);
    // Check for thumbnails (e.g., 4 visible)
    const thumbnails = screen.getAllByRole('img', { name: /thumbnail/i });
    expect(thumbnails.length).toBeGreaterThanOrEqual(4);
    
    // Check for "+n" badge (for 5 total images)
    expect(screen.getByText('+1')).toBeDefined();
  });

  it('renders the zoom overlay button', () => {
    render(<ProductGallery images={mockImages} />);
    expect(screen.getByText(/Hover to zoom/i)).toBeDefined();
  });
});
