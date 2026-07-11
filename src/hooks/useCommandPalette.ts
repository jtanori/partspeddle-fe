'use client';

import * as React from 'react';

export interface UseCommandPaletteResult {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
}

/**
 * Opens a command palette on Cmd+K (macOS) or Ctrl+K (Windows/Linux).
 * Prevents triggering when typing in inputs or textareas.
 */
export function useCommandPalette(): UseCommandPaletteResult {
  const [open, setOpen] = React.useState(false);

  const toggle = React.useCallback(() => {
    setOpen((prev) => !prev);
  }, []);

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isModifier = event.metaKey || event.ctrlKey;
      if (isModifier && event.key.toLowerCase() === 'k') {
        // Global shortcut: Cmd+K toggles the palette even inside inputs.
        event.preventDefault();
        setOpen((prev) => !prev);
      }

      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return { open, setOpen, toggle };
}
