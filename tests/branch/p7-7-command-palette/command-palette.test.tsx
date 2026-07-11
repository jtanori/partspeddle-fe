import * as React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SearchCommandPalette } from '@/components/search/SearchCommandPalette';
import { useCommandPalette } from '@/hooks/useCommandPalette';

vi.mock('@/components/search/SearchDropdownController', () => ({
  SearchDropdownController: ({ query, onResults }: any) => {
    React.useEffect(() => {
      if (!query) return;
      const id = setTimeout(() => {
        onResults({
          metadata: { totalHits: 1, query, generatedAt: Date.now() },
          products: {
            hits: [{ id: 'p1', type: 'product', label: 'Alternator' }],
            total: 1,
          },
          vehicles: { hits: [], total: 0 },
          taxonomy: { hits: [], total: 0 },
          manufacturers: { hits: [], total: 0 },
        });
      }, 0);
      return () => clearTimeout(id);
    }, [query, onResults]);
    return null;
  },
}));

vi.mock('@/components/search/SearchResultsDropdown', () => ({
  SearchResultsDropdown: ({ onSelect, onViewAll, query, onClose }: any) => (
    <div data-testid="results-dropdown">
      <span data-testid="results-query">{query}</span>
      <button
        type="button"
        data-testid="select-result"
        onClick={() => onSelect({ id: 'p1', type: 'product', label: 'Alternator' })}
      >
        Select
      </button>
      <button type="button" data-testid="view-all" onClick={onViewAll}>
        View all
      </button>
      <button type="button" data-testid="results-close" onClick={onClose}>
        Close
      </button>
    </div>
  ),
}));

function CommandPaletteWrapper() {
  const { open, setOpen } = useCommandPalette();
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} data-testid="open">
        Open
      </button>
      <SearchCommandPalette
        open={open}
        onClose={() => setOpen(false)}
        onSelect={vi.fn()}
      />
    </>
  );
}

describe('P7.7 Phase 11 — Live Search Command Palette', () => {
  it('renders when open is true', () => {
    render(<SearchCommandPalette open onClose={vi.fn()} onSelect={vi.fn()} />);
    expect(screen.getByRole('dialog')).toBeDefined();
    expect(
      screen.getByPlaceholderText('Search parts, vehicles, categories, sellers...'),
    ).toBeDefined();
  });

  it('does not render when open is false', () => {
    render(<SearchCommandPalette open={false} onClose={vi.fn()} onSelect={vi.fn()} />);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('toggles on Cmd+K / Ctrl+K', () => {
    render(<CommandPaletteWrapper />);
    expect(screen.queryByRole('dialog')).toBeNull();

    fireEvent.keyDown(window, { key: 'k', metaKey: true });
    expect(screen.getByRole('dialog')).toBeDefined();

    fireEvent.keyDown(window, { key: 'k', metaKey: true });
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('closes on Escape', () => {
    render(<CommandPaletteWrapper />);
    fireEvent.click(screen.getByTestId('open'));
    expect(screen.getByRole('dialog')).toBeDefined();

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('calls onClose when the close button is clicked', () => {
    const onClose = vi.fn();
    render(<SearchCommandPalette open onClose={onClose} onSelect={vi.fn()} />);
    fireEvent.click(screen.getByLabelText('Close command palette'));
    expect(onClose).toHaveBeenCalled();
  });

  it('shows helper text when empty', () => {
    render(<SearchCommandPalette open onClose={vi.fn()} onSelect={vi.fn()} />);
    expect(screen.getByText('Start typing to search across the marketplace.')).toBeDefined();
  });

  it('updates query on input change', async () => {
    render(<SearchCommandPalette open onClose={vi.fn()} onSelect={vi.fn()} />);
    const input = screen.getByPlaceholderText('Search parts, vehicles, categories, sellers...');
    fireEvent.change(input, { target: { value: 'alternator' } });
    await waitFor(() => {
      expect(input).toHaveValue('alternator');
    });
  });

  it('calls onSelect when a result is chosen and closes the palette', async () => {
    const onSelect = vi.fn();
    const onClose = vi.fn();
    render(<SearchCommandPalette open onClose={onClose} onSelect={onSelect} />);

    const input = screen.getByPlaceholderText('Search parts, vehicles, categories, sellers...');
    fireEvent.change(input, { target: { value: 'alternator' } });

    await waitFor(() => {
      expect(screen.getByTestId('results-dropdown')).toBeDefined();
    });

    fireEvent.click(screen.getByTestId('select-result'));
    expect(onSelect).toHaveBeenCalledWith({
      id: 'p1',
      type: 'product',
      label: 'Alternator',
    });
    expect(onClose).toHaveBeenCalled();
  });
});
