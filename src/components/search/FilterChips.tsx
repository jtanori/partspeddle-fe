import React from 'react';
import { X } from 'lucide-react';

interface FilterChip {
  type: string;
  label: string;
  clear?: () => void;
}

interface FilterChipsProps {
  filters: FilterChip[];
}

export const FilterChips: React.FC<FilterChipsProps> = ({ filters }) => {
  if (filters.length === 0) return null;

  return (
    <div className="mb-6 flex flex-wrap items-center gap-2">
      {filters
        .filter((f) => f.type !== 'sort')
        .map((filt, idx) => (
          <span
            key={idx}
            className="flex items-center gap-1.5 whitespace-nowrap rounded-full border border-stroke-subtle bg-surface-secondary px-3 py-1 text-xs text-foreground-secondary select-none"
          >
            {filt.label}
            {filt.clear && (
              <X
                className="h-3 w-3 cursor-pointer text-foreground-muted transition-colors hover:text-brand-primary"
                onClick={(e) => {
                  e.stopPropagation();
                  filt.clear?.();
                }}
              />
            )}
          </span>
        ))}
    </div>
  );
};
