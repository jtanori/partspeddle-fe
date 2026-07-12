import React from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ViewAllButtonProps {
  onClick: () => void;
  className?: string;
  text?: string;
}

export const ViewAllButton: React.FC<ViewAllButtonProps> = ({
  onClick,
  className = '',
  text = 'View All',
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-1 font-display text-sm font-bold uppercase tracking-wider text-brand-primary transition-colors hover:text-brand-primary-hover',
        className,
      )}
    >
      {text}
      <ChevronRight className="h-4 w-4 stroke-[2.5]" />
    </button>
  );
};
