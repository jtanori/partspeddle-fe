import React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Filter {
  key: string;
  label: string;
}

interface ActiveFiltersBarProps {
  filters: Filter[];
  onRemove: (key: string) => void;
  onClearAll: () => void;
  className?: string;
}

export const ActiveFiltersBar: React.FC<ActiveFiltersBarProps> = ({
  filters,
  onRemove,
  onClearAll,
  className = '',
}) => {
  if (filters.length === 0) return null;

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {filters.map((filter) => (
        <span
          key={filter.key}
          className="flex items-center gap-1.5 rounded-sm border border-stroke-subtle bg-surface-secondary px-2.5 py-1 font-sans text-xs font-semibold text-foreground-primary"
        >
          {filter.label}
          <button
            onClick={() => onRemove(filter.key)}
            className="transition-colors hover:text-status-danger"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <button
        onClick={onClearAll}
        className="ml-2 text-xs font-medium text-foreground-muted underline underline-offset-4 hover:text-foreground-primary"
      >
        Clear All
      </button>
    </div>
  );
};
