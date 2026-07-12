'use client';

import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InspectorPanelProps extends React.HTMLAttributes<HTMLElement> {
  title?: string;
  onClose?: () => void;
}

/**
 * Contextual right-side inspector panel for workspace pages.
 */
export function InspectorPanel({
  title,
  onClose,
  children,
  className,
  ...props
}: InspectorPanelProps) {
  return (
    <aside
      className={cn(
        'h-full w-[320px] overflow-y-auto border-l border-stroke-subtle bg-surface-primary p-5',
        className,
      )}
      {...props}
    >
      {(title || onClose) && (
        <div className="mb-5 flex items-center justify-between gap-3">
          {title && (
            <h3 className="font-display text-meta font-black uppercase tracking-[0.2em] text-foreground-muted">
              {title}
            </h3>
          )}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close inspector"
              className="rounded p-1 text-foreground-muted outline-none transition-colors hover:text-foreground-primary focus-visible:ring-2 focus-visible:ring-brand-primary"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      )}
      {children}
    </aside>
  );
}
