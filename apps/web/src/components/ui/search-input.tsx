'use client';

import React, { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'onChange' | 'onSubmit'
> {
  value?: string;
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  loading?: boolean;
  placeholder?: string;
  formClassName?: string;
}

/**
 * Canonical search input with icon and loading state.
 */
export function SearchInput({
  value,
  onChange,
  onSubmit,
  loading = false,
  placeholder = 'Search parts, vehicles, sellers...',
  className,
  formClassName,
  ...inputProps
}: SearchInputProps) {
  const [internalValue, setInternalValue] = useState(value ?? '');
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value;
    if (!isControlled) setInternalValue(next);
    onChange?.(next);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(currentValue);
  };

  return (
    <form onSubmit={handleSubmit} className={cn('relative w-full', formClassName)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
      <input
        type="search"
        value={currentValue}
        onChange={handleChange}
        placeholder={placeholder}
        className={cn(
          'h-10 w-full rounded-lg border border-stroke-default bg-surface-primary py-2 pl-9 pr-10',
          'text-body text-foreground-primary placeholder:text-foreground-muted',
          'outline-none focus-visible:border-brand-primary focus-visible:ring-2 focus-visible:ring-brand-primary/20',
          className,
        )}
        {...inputProps}
      />
      {loading && (
        <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-foreground-muted" />
      )}
    </form>
  );
}
