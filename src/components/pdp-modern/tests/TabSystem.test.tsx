import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import TabSystem from '../TabSystem';

describe('TabSystem', () => {
  const tabs = [
    { id: 'spec', label: 'Specifications', content: <div>Spec Content</div> },
    { id: 'fitment', label: 'Fitment', content: <div>Fitment Content</div> },
  ];

  it('renders tab labels', () => {
    render(<TabSystem tabs={tabs} />);
    expect(screen.getByText('Specifications')).toBeDefined();
    expect(screen.getByText('Fitment')).toBeDefined();
  });

  it('switches content when tab is clicked', () => {
    render(<TabSystem tabs={tabs} />);
    
    // Default is first tab
    expect(screen.getByText('Spec Content')).toBeDefined();
    
    // Switch to fitment
    fireEvent.click(screen.getByText('Fitment'));
    expect(screen.getByText('Fitment Content')).toBeDefined();
    expect(screen.queryByText('Spec Content')).toBeNull();
  });
});
