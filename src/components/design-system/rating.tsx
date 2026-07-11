import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RatingProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  count?: number;
  size?: 'xs' | 'sm' | 'md';
  showValue?: boolean;
}

/**
 * Star rating display with optional review count.
 * Supports half-star values by clipping the foreground star layer.
 */
export function Rating({
  value,
  count,
  size = 'sm',
  showValue = true,
  className,
  ...props
}: RatingProps) {
  const normalized = Math.min(5, Math.max(0, value));
  const percentage = (normalized / 5) * 100;

  const sizes = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
  };

  return (
    <div className={cn('inline-flex items-center gap-1.5', className)} {...props}>
      <div className="relative inline-flex">
        {/* Background stars */}
        <div className="flex items-center gap-0.5 text-stroke-default">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={`bg-${i}`} className={cn(sizes[size], 'fill-current')} />
          ))}
        </div>
        {/* Foreground stars clipped by rating percentage */}
        <div
          className="absolute inset-0 flex items-center gap-0.5 overflow-hidden text-status-warning"
          style={{ width: `${percentage}%` }}
        >
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={`fg-${i}`} className={cn(sizes[size], 'fill-current')} />
          ))}
        </div>
      </div>
      {showValue && (
        <span className="text-caption font-bold text-foreground-secondary">
          {normalized.toFixed(1)}
        </span>
      )}
      {count !== undefined && count > 0 && (
        <span className="text-meta text-foreground-muted">({count.toLocaleString()})</span>
      )}
    </div>
  );
}
