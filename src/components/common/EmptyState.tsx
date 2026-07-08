import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionText,
  onAction,
  icon,
  className = '',
}) => {
  return (
    <div
      className={cn(
        'space-y-6 rounded-sm border-2 border-dashed border-stroke-subtle bg-surface-primary p-12 text-center',
        className,
      )}
    >
      {icon && <div className="flex justify-center">{icon}</div>}
      <div className="space-y-2">
        <h3 className="font-display text-2xl font-black uppercase leading-tight text-foreground-primary">
          {title}
        </h3>
        <p className="mx-auto max-w-lg font-sans text-sm text-foreground-muted">{description}</p>
      </div>
      {actionText && onAction && (
        <Button onClick={onAction}>{actionText}</Button>
      )}
    </div>
  );
};
