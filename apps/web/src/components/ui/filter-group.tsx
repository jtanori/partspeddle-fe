'use client';

import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilterOption {
  value: string;
  label: string;
  count?: number;
  checked?: boolean;
}

interface FilterGroupProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  title: string;
  options: FilterOption[];
  onChange?: (value: string, checked: boolean) => void;
}

/**
 * Sidebar filter group with checkboxes.
 */
export function FilterGroup({ title, options, onChange, className, ...props }: FilterGroupProps) {
  return (
    <div className={cn('space-y-3', className)} {...props}>
      <h4 className="flex items-center justify-between text-caption font-black uppercase tracking-widest text-foreground-primary">
        {title}
        <ChevronDown className="h-4 w-4 text-foreground-muted" />
      </h4>
      <ul className="space-y-2">
        {options.map((option) => (
          <li key={option.value}>
            <label className="flex cursor-pointer items-center gap-2 text-body text-foreground-secondary hover:text-foreground-primary">
              <input
                type="checkbox"
                value={option.value}
                checked={option.checked}
                onChange={(e) => onChange?.(option.value, e.target.checked)}
                className="h-4 w-4 rounded border-stroke-default text-brand-primary focus-visible:ring-2 focus-visible:ring-brand-primary"
              />
              <span className="flex-1">{option.label}</span>
              {option.count !== undefined && (
                <span className="text-meta text-foreground-muted">({option.count})</span>
              )}
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
