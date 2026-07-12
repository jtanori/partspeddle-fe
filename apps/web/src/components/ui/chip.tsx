import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  label: string;
  variant?: 'default' | 'primary' | 'secondary' | 'outline';
  active?: boolean;
}

/**
 * Non-removable tag chip.
 */
export function Chip({
  label,
  variant = 'default',
  active = false,
  className,
  ...props
}: ChipProps) {
  const variants = {
    default: 'bg-surface-secondary text-foreground-secondary border-stroke-subtle',
    primary: 'bg-brand-primary text-foreground-inverse border-transparent',
    secondary: 'bg-surface-muted text-foreground-primary border-stroke-subtle',
    outline: 'bg-transparent text-foreground-primary border-stroke-default',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold',
        active && 'ring-2 ring-brand-primary/20',
        variants[variant],
        className,
      )}
      {...props}
    >
      {label}
    </span>
  );
}

interface FilterChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  label: string;
  onRemove?: () => void;
  variant?: 'default' | 'primary';
}

/**
 * Removable filter chip with a close button.
 */
export function FilterChip({
  label,
  onRemove,
  variant = 'default',
  className,
  ...props
}: FilterChipProps) {
  const variants = {
    default: 'bg-surface-secondary text-foreground-secondary border-stroke-subtle',
    primary: 'bg-brand-primary text-foreground-inverse border-transparent',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold',
        variants[variant],
        className,
      )}
      {...props}
    >
      {label}
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          aria-label={`Remove ${label} filter`}
          className="rounded-full p-0.5 hover:bg-black/10 focus-visible:ring-2 focus-visible:ring-brand-primary"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </span>
  );
}
