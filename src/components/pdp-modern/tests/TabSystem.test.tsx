import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import TabSystem from '../TabSystem';
import { PartViewModel } from '@/domain/types/pdp.types';

describe('TabSystem', () => {
  const mockViewModel = {
    tabs: [
      { id: 'spec', label: 'Specifications', content: <div>Spec Content</div> },
      { id: 'fitment', label: 'Fitment', content: <div>Fitment Content</div> },
    ],
  } as unknown as PartViewModel;

  it('renders tab labels', () => {
    render(<TabSystem viewModel={mockViewModel} />);
    expect(screen.getByText('Specifications')).toBeDefined();
    expect(screen.getByText('Fitment')).toBeDefined();
  });

  it('switches content when tab is clicked', () => {
    render(<TabSystem viewModel={mockViewModel} />);
    
    // Default is first tab
    expect(screen.getByText('Spec Content')).toBeDefined();
    
    // Switch to fitment
    fireEvent.click(screen.getByText('Fitment'));
    expect(screen.getByText('Fitment Content')).toBeDefined();
    expect(screen.queryByText('Spec Content')).toBeNull();
  });
});
