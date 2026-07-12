import { cn } from '@/lib/utils';

interface PriceProps extends React.HTMLAttributes<HTMLSpanElement> {
  amount: number;
  currency?: string;
  compareAtAmount?: number;
  size?: 'meta' | 'body' | 'card-title' | 'section' | 'hero';
}

/**
 * Currency-formatted price with optional compare-at (strikethrough) price.
 */
export function Price({
  amount,
  currency = 'USD',
  compareAtAmount,
  size = 'body',
  className,
  ...props
}: PriceProps) {
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  const sizes = {
    meta: 'text-meta',
    body: 'text-body',
    'card-title': 'text-card-title',
    section: 'text-section',
    hero: 'text-hero',
  };

  return (
    <span
      className={cn('inline-flex items-baseline gap-2 font-black tracking-tight', className)}
      {...props}
    >
      <span className={cn('text-foreground-primary', sizes[size])}>{formatted}</span>
      {compareAtAmount !== undefined && compareAtAmount > amount && (
        <span className="text-meta font-semibold text-foreground-muted line-through">
          {new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency,
          }).format(compareAtAmount)}
        </span>
      )}
    </span>
  );
}
