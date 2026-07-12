import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import NeedHelp from '../NeedHelp';

describe('NeedHelp', () => {
  it('renders support channels', () => {
    render(<NeedHelp />);
    expect(screen.getByText('Need Help?')).toBeDefined();
    expect(screen.getByText('Live Chat')).toBeDefined();
    expect(screen.getByText('Call Us')).toBeDefined();
  });
});
