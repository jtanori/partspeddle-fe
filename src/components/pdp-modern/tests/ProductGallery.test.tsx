import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ProductGallery from '../ProductGallery';

describe('ProductGallery', () => {
  const mockImages = [
    'https://img1.com',
    'https://img2.com',
  ];

  it('renders the gallery with the first image', () => {
    render(<ProductGallery images={mockImages} />);
    const image = screen.getByRole('img');
    expect(image.getAttribute('src')).toBe(mockImages[0]);
  });

  it('changes image when clicking next', () => {
    render(<ProductGallery images={mockImages} />);
    const nextButton = screen.getAllByRole('button')[1]; // Next button
    fireEvent.click(nextButton);
    const image = screen.getByRole('img');
    expect(image.getAttribute('src')).toBe(mockImages[1]);
  });
});
