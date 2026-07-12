import { cn } from '@/lib/utils';

/**
 * Outer page container.
 * Max-width: 1440px, centered, full-width with horizontal padding.
 */
export function Container({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('mx-auto w-full max-w-[var(--container-max)] px-4', className)} {...props}>
      {children}
    </div>
  );
}
