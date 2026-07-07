import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
}

/**
 * Accessible breadcrumb navigation.
 */
export function Breadcrumb({
  items,
  separator = <ChevronRight className="h-3.5 w-3.5" />,
  className,
  ...props
}: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn('w-full', className)} {...props}>
      <ol className="flex flex-wrap items-center gap-2 text-meta text-foreground-muted">
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <li key={idx} className="flex items-center gap-2">
              {item.href && !isLast ? (
                <a
                  href={item.href}
                  className="hover:text-brand-primary focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                >
                  {item.label}
                </a>
              ) : (
                <span
                  className={cn(
                    'truncate uppercase tracking-tighter',
                    isLast ? 'text-foreground-primary' : 'text-foreground-muted',
                  )}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.label}
                </span>
              )}
              {!isLast && (
                <span className="text-foreground-muted" aria-hidden="true">
                  {separator}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
