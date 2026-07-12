import React from 'react';
import { useIsClient } from '@/hooks/useIsClient';
import { ChevronDown, ChevronRight, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FacetFilterProps {
  title: string;
  type: 'checkbox' | 'range' | 'select';
  options?: { label: string; value: string; count: number }[];
  selectedValues: string[];
  onChange: (value: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  isDisabled: boolean;
}

export const FacetFilter: React.FC<FacetFilterProps> = ({
  title,
  type,
  options = [],
  selectedValues,
  onChange,
  isOpen,
  onToggle,
  isDisabled,
}) => {
  const isMounted = useIsClient();
  const disabled = isDisabled && isMounted;

  return (
    <div className="space-y-2">
      <div
        onClick={disabled ? undefined : onToggle}
        className={cn(
          'flex items-center justify-between border-b border-stroke-subtle pb-2',
          disabled
            ? 'cursor-not-allowed text-foreground-muted'
            : 'cursor-pointer text-foreground-primary',
        )}
      >
        <span className="font-display text-sm uppercase tracking-wider">{title}</span>
        {isOpen && !disabled ? (
          <ChevronDown className="h-4 w-4 text-foreground-muted" />
        ) : (
          <ChevronRight className="h-4 w-4 text-foreground-muted" />
        )}
      </div>

      {isOpen && !disabled && type === 'checkbox' && (
        <div className="space-y-1 pl-2">
          {options.map((option) => {
            const selected = selectedValues.includes(option.value);
            return (
              <label
                key={option.value}
                className="flex cursor-pointer items-center gap-2 text-sm text-foreground-secondary hover:text-foreground-primary"
              >
                <div
                  className={cn(
                    'flex h-4 w-4 items-center justify-center rounded border',
                    selected
                      ? 'border-brand-primary bg-brand-primary'
                      : 'border-stroke-subtle bg-surface-primary',
                  )}
                >
                  {selected && <Check className="h-3 w-3 text-foreground-inverse" />}
                </div>
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={() => onChange(option.value)}
                  className="sr-only"
                />
                {option.label} ({option.count})
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
};
