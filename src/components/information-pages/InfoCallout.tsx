import * as React from 'react';
import { Info, CheckCircle, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';

interface InfoCalloutProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'info' | 'success' | 'warning' | 'neutral';
  title?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

const variantMap = {
  info: {
    border: 'border-l-status-info',
    bg: 'bg-status-info-soft',
    iconColor: 'text-status-info',
    Icon: Info,
  },
  success: {
    border: 'border-l-status-success',
    bg: 'bg-status-success-soft',
    iconColor: 'text-status-success',
    Icon: CheckCircle,
  },
  warning: {
    border: 'border-l-status-warning',
    bg: 'bg-status-warning-soft',
    iconColor: 'text-status-warning',
    Icon: AlertTriangle,
  },
  neutral: {
    border: 'border-l-foreground-muted',
    bg: 'bg-surface-secondary',
    iconColor: 'text-foreground-muted',
    Icon: Info,
  },
};

/**
 * Contextual callout panel for highlights, warnings, and success states.
 */
export function InfoCallout({
  variant = 'info',
  title,
  children,
  icon,
  className,
  ...props
}: InfoCalloutProps) {
  const { border, bg, iconColor, Icon: DefaultIcon } = variantMap[variant];

  return (
    <Card
      className={cn(
        'border-l-4 shadow-none',
        border,
        bg,
        className,
      )}
      {...props}
    >
      <div className="flex items-start gap-4">
        <div className={cn('shrink-0', iconColor)}>{icon ?? <DefaultIcon className="h-5 w-5" />}</div>
        <div>
          {title && <p className="font-display text-caption font-bold uppercase tracking-wider text-foreground-primary">{title}</p>}
          <div className="mt-1 font-sans text-body leading-relaxed text-foreground-secondary">{children}</div>
        </div>
      </div>
    </Card>
  );
}
