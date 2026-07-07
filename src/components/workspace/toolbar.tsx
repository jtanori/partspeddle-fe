import { cn } from '@/lib/utils';

/**
 * Page-level toolbar for filters, sort, search, and actions.
 */
export function Toolbar({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-3 border-b border-stroke-subtle bg-surface-primary p-3',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
