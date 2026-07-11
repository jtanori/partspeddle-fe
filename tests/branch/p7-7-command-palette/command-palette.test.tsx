import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SearchCommandPalette } from '@/components/search/SearchCommandPalette';
import { useCommandPalette } from '@/hooks/useCommandPalette';

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

  it('calls onClose when the backdrop is clicked', () => {
    const onClose = vi.fn();
    render(<SearchCommandPalette open onClose={onClose} onSelect={vi.fn()} />);
    const backdrop = screen.getByRole('dialog').parentElement?.previousSibling;
    if (backdrop && backdrop instanceof Element) {
      fireEvent.click(backdrop);
    }
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
});
