'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaginationProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  currentPage: number;
  totalPages: number;
  onChange: (page: number) => void;
  siblingCount?: number;
}

/**
 * Accessible pagination control.
 */
export function Pagination({
  currentPage,
  totalPages,
  onChange,
  siblingCount = 1,
  className,
  ...props
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages: (number | string)[] = [];
  const firstPage = 1;
  const lastPage = totalPages;

  // Always show first and last, plus current and siblings.
  const leftSibling = Math.max(firstPage + 1, currentPage - siblingCount);
  const rightSibling = Math.min(lastPage - 1, currentPage + siblingCount);

  pages.push(firstPage);
  if (leftSibling > firstPage + 1) pages.push('...');
  for (let i = leftSibling; i <= rightSibling; i++) {
    if (i !== firstPage && i !== lastPage) pages.push(i);
  }
  if (rightSibling < lastPage - 1) pages.push('...');
  if (lastPage !== firstPage) pages.push(lastPage);

  const PageButton = ({ page, isActive }: { page: number; isActive?: boolean }) => (
    <button
      type="button"
      onClick={() => onChange(page)}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'flex h-9 w-9 items-center justify-center rounded-md text-caption font-bold outline-none transition-colors',
        isActive
          ? 'bg-brand-primary text-foreground-inverse'
          : 'text-foreground-secondary hover:bg-surface-secondary focus-visible:ring-2 focus-visible:ring-brand-primary',
      )}
    >
      {page}
    </button>
  );

  return (
    <nav aria-label="Pagination" className={cn('flex items-center gap-1', className)} {...props}>
      <button
        type="button"
        onClick={() => onChange(currentPage - 1)}
        disabled={currentPage === firstPage}
        aria-label="Previous page"
        className="flex h-9 w-9 items-center justify-center rounded-md text-foreground-secondary outline-none transition-colors hover:bg-surface-secondary disabled:cursor-not-allowed disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-brand-primary"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {pages.map((page, idx) => {
        if (page === '...') {
          return (
            <span key={`ellipsis-${idx}`} className="px-2 text-foreground-muted" aria-hidden="true">
              ...
            </span>
          );
        }
        return <PageButton key={page} page={page as number} isActive={page === currentPage} />;
      })}

      <button
        type="button"
        onClick={() => onChange(currentPage + 1)}
        disabled={currentPage === lastPage}
        aria-label="Next page"
        className="flex h-9 w-9 items-center justify-center rounded-md text-foreground-secondary outline-none transition-colors hover:bg-surface-secondary disabled:cursor-not-allowed disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-brand-primary"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}
