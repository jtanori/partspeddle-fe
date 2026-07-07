import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?:
    | 'default'
    | 'primary'
    | 'secondary'
    | 'success'
    | 'warning'
    | 'danger'
    | 'info'
    | 'outline';
}

const variants = {
  default: 'bg-surface-secondary text-foreground-secondary border-stroke-subtle',
  primary: 'bg-brand-primary text-foreground-inverse border-transparent',
  secondary: 'bg-surface-muted text-foreground-primary border-stroke-subtle',
  success: 'bg-status-success-soft text-status-success border-status-success/20',
  warning: 'bg-status-warning-soft text-status-warning border-status-warning/20',
  danger: 'bg-status-danger-soft text-status-danger border-status-danger/20',
  info: 'bg-status-info-soft text-status-info border-status-info/20',
  outline: 'bg-transparent text-foreground-primary border-stroke-default',
};

/**
 * Small status/label badge using the design-system tokens.
 */
export default function Badge({ children, className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        // text-xs (12px) maps to the --text-meta token.
        'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-bold',
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
