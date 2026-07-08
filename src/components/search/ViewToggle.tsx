import React from 'react';
import { LayoutGrid, List } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ViewToggleProps {
  currentView: 'grid' | 'list';
  onViewChange: (view: 'grid' | 'list') => void;
  className?: string;
}

export const ViewToggle: React.FC<ViewToggleProps> = ({
  currentView,
  onViewChange,
  className = '',
}) => {
  return (
    <div className={cn('flex items-center gap-1 rounded-sm bg-surface-secondary p-1', className)}>
      <button
        onClick={() => onViewChange('grid')}
        className={cn(
          'rounded-sm p-1.5 transition-all',
          currentView === 'grid'
            ? 'bg-surface-primary text-foreground-primary shadow-sm'
            : 'text-foreground-muted hover:text-foreground-secondary',
        )}
        aria-label="Grid view"
      >
        <LayoutGrid className="h-4 w-4" />
      </button>
      <button
        onClick={() => onViewChange('list')}
        className={cn(
          'rounded-sm p-1.5 transition-all',
          currentView === 'list'
            ? 'bg-surface-primary text-foreground-primary shadow-sm'
            : 'text-foreground-muted hover:text-foreground-secondary',
        )}
        aria-label="List view"
      >
        <List className="h-4 w-4" />
      </button>
    </div>
  );
};
