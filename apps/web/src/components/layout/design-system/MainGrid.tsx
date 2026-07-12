import { cn } from '@/lib/utils';

/**
 * 12-column grid with the design-system gutter.
 * Use for page-level two/three-column layouts.
 */
export function MainGrid({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('grid grid-cols-1 gap-[var(--grid-gutter)] lg:grid-cols-12', className)}
      {...props}
    >
      {children}
    </div>
  );
}
