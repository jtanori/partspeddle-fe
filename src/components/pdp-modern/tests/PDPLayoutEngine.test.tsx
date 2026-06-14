import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import PDPLayoutEngine from '../PDPLayoutEngine';

describe('PDPLayoutEngine', () => {
  it('renders with correct grid structure', () => {
    render(
      <PDPLayoutEngine>
        <div data-testid="main">Main</div>
        <div data-testid="sidebar">Sidebar</div>
      </PDPLayoutEngine>
    );
    
    // Check for grid container
    const container = screen.getByTestId('layout-container');
    expect(container.className).toContain('grid-cols-1');
    expect(container.className).toContain('lg:grid-cols-12');
  });
});
