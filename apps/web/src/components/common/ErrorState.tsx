import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  description = 'We could not load the requested data. Please try again.',
  onRetry,
  className = '',
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center space-y-4 rounded-xl border border-status-danger/20 bg-status-danger-soft p-12 text-center',
        className,
      )}
      role="alert"
    >
      <AlertTriangle className="h-12 w-12 text-status-danger" />
      <div className="space-y-2">
        <h3 className="font-display text-xl font-black uppercase text-foreground-primary">
          {title}
        </h3>
        <p className="mx-auto max-w-md text-sm text-foreground-muted">{description}</p>
      </div>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          <RefreshCw className="mr-1.5 h-4 w-4" />
          Try Again
        </Button>
      )}
    </div>
  );
};
