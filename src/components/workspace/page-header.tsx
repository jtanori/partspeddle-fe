import { cn } from '@/lib/utils';
import { Breadcrumb, BreadcrumbItem } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';

interface PageHeaderAction {
  label: string;
  onClick?: () => void;
  href?: string;
  variant?: 'default' | 'secondary' | 'outline' | 'ghost';
}

interface PageHeaderProps extends React.HTMLAttributes<HTMLElement> {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  primaryAction?: PageHeaderAction;
  secondaryAction?: PageHeaderAction;
}

/**
 * Consistent workspace page header with title, subtitle, breadcrumbs, and actions.
 */
export function PageHeader({
  title,
  subtitle,
  breadcrumbs,
  primaryAction,
  secondaryAction,
  className,
  ...props
}: PageHeaderProps) {
  return (
    <header className={cn('space-y-3 border-b border-stroke-subtle pb-4', className)} {...props}>
      {breadcrumbs && <Breadcrumb items={breadcrumbs} />}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-section font-black uppercase tracking-tight text-foreground-primary">
            {title}
          </h1>
          {subtitle && <p className="mt-1 text-caption text-foreground-secondary">{subtitle}</p>}
        </div>
        {(primaryAction || secondaryAction) && (
          <div className="flex items-center gap-2">
            {secondaryAction && (
              <Button
                variant={secondaryAction.variant ?? 'outline'}
                onClick={secondaryAction.onClick}
              >
                {secondaryAction.label}
              </Button>
            )}
            {primaryAction && (
              <Button variant={primaryAction.variant ?? 'default'} onClick={primaryAction.onClick}>
                {primaryAction.label}
              </Button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
