import { cn } from '@/lib/utils';

/**
 * Inner content width container.
 * Max-width: 1280px, centered, full-width with horizontal padding.
 * Use this for main page content inside `<Container>`.
 */
export function Content({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('mx-auto w-full max-w-[var(--content-max)] px-4 sm:px-6', className)}
      {...props}
    >
      {children}
    </div>
  );
}
