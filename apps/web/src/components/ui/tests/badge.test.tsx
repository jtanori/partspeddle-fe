import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Badge from '../badge';

describe('Badge', () => {
  it('renders content correctly', () => {
    render(<Badge>Test Badge</Badge>);
    expect(screen.getByText('Test Badge')).toBeDefined();
  });
});
