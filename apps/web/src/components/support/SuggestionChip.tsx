import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SuggestionChipProps {
  label: string;
  onClick: () => void;
  className?: string;
}

export function SuggestionChip({ label, onClick, className }: SuggestionChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full border border-stroke-subtle bg-surface-primary px-3 py-1.5 text-sm text-foreground-secondary transition-colors hover:border-brand-primary hover:text-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary',
        className,
      )}
    >
      {label}
    </button>
  );
}
