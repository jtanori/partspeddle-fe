'use client';

import * as React from 'react';
import { Dialog } from '@base-ui/react/dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  children: React.ReactNode;
  side?: 'left' | 'right';
}

/**
 * Slide-in drawer using Base UI dialog primitive.
 */
export function Drawer({ open, onClose, title, children, side = 'right' }: DrawerProps) {
  return (
    <Dialog.Root open={open} onOpenChange={(isOpen: boolean) => !isOpen && onClose()}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-foreground-primary/50 backdrop-blur-xs transition-opacity" />
        <Dialog.Popup
          className={cn(
            'fixed top-0 z-50 h-full w-full max-w-sm border-stroke-subtle bg-surface-primary p-6 shadow-floating outline-none focus-visible:ring-2 focus-visible:ring-brand-primary',
            side === 'left' ? 'left-0 border-r' : 'right-0 border-l',
          )}
        >
          <div className="mb-6 flex items-center justify-between gap-4">
            <Dialog.Title className="text-section font-display font-black uppercase tracking-tight text-foreground-primary">
              {title}
            </Dialog.Title>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close drawer"
              className="rounded-md p-1 text-foreground-muted outline-none transition-colors hover:text-foreground-primary focus-visible:ring-2 focus-visible:ring-brand-primary"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          {children}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
