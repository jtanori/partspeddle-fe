import { cn } from '@/lib/utils';

type CardProps = React.HTMLAttributes<HTMLDivElement>;

/**
 * Primary card: white background, 16px radius, subtle border and shadow, 24px padding.
 */
export function Card({ children, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-stroke-subtle bg-surface-primary p-5 shadow-card',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * Secondary card: light gray background, no shadow, 16px padding.
 */
export function CardSecondary({ children, className, ...props }: CardProps) {
  return (
    <div
      className={cn('rounded-xl border border-stroke-subtle bg-surface-secondary p-4', className)}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * Floating action card: sticky-capable, elevated shadow.
 * Used for CTAs, checkout summaries, filters, and sticky sidebars.
 */
export function CardFloating({ children, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-stroke-default bg-surface-primary p-5 shadow-floating',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
